import * as React from "react";
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
    type InfiniteData,
} from "@tanstack/react-query";
import type {
    ChatMessage,
    ChatMessageDeleteEvent,
    ChatReadReceiptUpdate,
    ChatReactionType,
    ChatReactionUpdate,
    ChatMessageType,
    ChatPresenceUpdate,
    ChatMessageUser,
    ChatTypingEvent,
    LinkPreview,
} from "../../interfaces";
import { buildApiUrl } from "./api";
import {
    disconnectChatSocket,
    ensureChatSocketConnected,
    getChatSocket,
} from "./chatSocket";

type SendChatMessageInput = {
    roomKey?: string;
    messageType?: ChatMessageType;
    body?: string;
    mediaProvider?: string;
    mediaId?: string;
    mediaUrl?: string;
};

type UploadChatImageInput = {
    roomKey?: string;
    file: File;
};

type UpdateChatMessageInput = {
    messageId: number;
    body: string;
};

type DeleteChatMessageInput = {
    messageId: number;
};

type UploadedChatImage = {
    provider: string;
    mediaId: string;
    mediaUrl: string;
};

type ToggleChatReactionInput = {
    messageId: number;
    reactionType: ChatReactionType;
};

type MarkChatReadReceiptInput = {
    roomKey?: string;
    messageId: number;
};

const DEFAULT_ROOM_KEY = "global";
const CHAT_MESSAGE_PAGE_SIZE = 40;
const TYPING_IDLE_TIMEOUT_MS = 30000;

type ChatMessagesPage = {
    messages: ChatMessage[];
    previousCursor: number | null;
    hasPreviousPage: boolean;
};

const getSessionToken = () => {
    const token = localStorage.getItem("session_token");

    if (!token) {
        throw new Error("Not authenticated");
    }

    return token;
};

const readFileAsDataUrl = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result !== "string") {
                reject(new Error("Failed to read image file"));
                return;
            }

            resolve(reader.result);
        };

        reader.onerror = () => {
            reject(new Error("Failed to read image file"));
        };

        reader.readAsDataURL(file);
    });
};

const appendChatMessage = (
    currentData: InfiniteData<ChatMessagesPage> | undefined,
    incomingMessage: ChatMessage,
) => {
    if (!currentData) {
        return {
            pageParams: [null],
            pages: [
                {
                    messages: [incomingMessage],
                    previousCursor: null,
                    hasPreviousPage: false,
                },
            ],
        };
    }

    const alreadyExists = currentData.pages.some((page) => {
        return page.messages.some(
            (message) => message.id === incomingMessage.id,
        );
    });

    if (alreadyExists) {
        return currentData;
    }

    const lastPageIndex = currentData.pages.length - 1;
    const nextPages = currentData.pages.map((page, index) => {
        if (index !== lastPageIndex) {
            return page;
        }

        return {
            ...page,
            messages: [...page.messages, incomingMessage],
        };
    });

    return {
        ...currentData,
        pages: nextPages,
    };
};

const updateChatMessageReactions = (
    currentData: InfiniteData<ChatMessagesPage> | undefined,
    reactionUpdate: ChatReactionUpdate,
) => {
    if (!currentData) {
        return currentData;
    }

    return {
        ...currentData,
        pages: currentData.pages.map((page) => {
            return {
                ...page,
                messages: page.messages.map((message) => {
                    if (message.id !== reactionUpdate.messageId) {
                        return message;
                    }

                    return {
                        ...message,
                        reactions: reactionUpdate.reactions,
                    };
                }),
            };
        }),
    };
};

const updateChatMessage = (
    currentData: InfiniteData<ChatMessagesPage> | undefined,
    updatedMessage: ChatMessage,
) => {
    if (!currentData) {
        return currentData;
    }

    let didUpdate = false;

    const nextPages = currentData.pages.map((page) => {
        return {
            ...page,
            messages: page.messages.map((message) => {
                if (message.id !== updatedMessage.id) {
                    return message;
                }

                didUpdate = true;
                return updatedMessage;
            }),
        };
    });

    if (!didUpdate) {
        return currentData;
    }

    return {
        ...currentData,
        pages: nextPages,
    };
};

const updateChatMessageReadReceipts = (
    currentData: InfiniteData<ChatMessagesPage> | undefined,
    readReceiptUpdate: ChatReadReceiptUpdate,
) => {
    if (!currentData || !readReceiptUpdate.readReceipt) {
        return currentData;
    }

    const { roomKey, readReceipt } = readReceiptUpdate;
    let didUpdate = false;

    const nextPages = currentData.pages.map((page) => {
        return {
            ...page,
            messages: page.messages.map((message) => {
                if (message.room_key !== roomKey) {
                    return message;
                }

                const nextReadReceipts = (
                    message.read_receipts ?? []
                ).filter((receipt) => {
                    return receipt.user_id !== readReceipt.user_id;
                });

                if (message.id === readReceipt.last_read_message_id) {
                    nextReadReceipts.push(readReceipt);
                    nextReadReceipts.sort((leftReceipt, rightReceipt) => {
                        return (
                            new Date(leftReceipt.last_read_at).getTime() -
                            new Date(rightReceipt.last_read_at).getTime()
                        );
                    });
                }

                const receiptsChanged =
                    nextReadReceipts.length !==
                        (message.read_receipts ?? []).length ||
                    nextReadReceipts.some((receipt, index) => {
                        const previousReceipt = message.read_receipts?.[index];

                        return (
                            previousReceipt?.user_id !== receipt.user_id ||
                            previousReceipt?.last_read_message_id !==
                                receipt.last_read_message_id ||
                            previousReceipt?.last_read_at !==
                                receipt.last_read_at
                        );
                    });

                if (!receiptsChanged) {
                    return message;
                }

                didUpdate = true;

                return {
                    ...message,
                    read_receipts: nextReadReceipts,
                };
            }),
        };
    });

    if (!didUpdate) {
        return currentData;
    }

    return {
        ...currentData,
        pages: nextPages,
    };
};

const removeChatMessage = (
    currentData: InfiniteData<ChatMessagesPage> | undefined,
    deletedMessageId: number,
) => {
    if (!currentData) {
        return currentData;
    }

    const nextPages = currentData.pages.map((page) => {
        return {
            ...page,
            messages: page.messages.filter((message) => {
                return message.id !== deletedMessageId;
            }),
        };
    });

    return {
        ...currentData,
        pages: nextPages,
    };
};

const ChatService = {
    useMessages(roomKey = DEFAULT_ROOM_KEY) {
        return useInfiniteQuery<
            ChatMessagesPage,
            Error,
            InfiniteData<ChatMessagesPage>,
            [string, string],
            number | null
        >({
            queryKey: ["chat-messages", roomKey],
            queryFn: async ({ pageParam }) => {
                const token = getSessionToken();
                const params = new URLSearchParams({
                    room: roomKey,
                    limit: String(CHAT_MESSAGE_PAGE_SIZE),
                });
                const beforeId =
                    typeof pageParam === "number" && pageParam > 0
                        ? pageParam
                        : null;

                if (beforeId !== null) {
                    params.set("beforeId", String(beforeId));
                }

                const res = await fetch(buildApiUrl(`/chat/messages?${params}`), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to load chat messages");
                }

                const data: ChatMessagesPage = await res.json();
                return data;
            },
            initialPageParam: null,
            getNextPageParam: () => {
                return undefined;
            },
            getPreviousPageParam: (firstPage) => {
                return firstPage.previousCursor ?? undefined;
            },
            retry: false,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        });
    },
    useUsers() {
        return useQuery<ChatMessageUser[], Error>({
            queryKey: ["chat-users"],
            queryFn: async () => {
                const token = getSessionToken();
                const res = await fetch(buildApiUrl("/chat/users"), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to load chat users");
                }

                const data: ChatMessageUser[] = await res.json();
                return data;
            },
            retry: false,
            staleTime: 10 * 60_000,
            gcTime: 30 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        });
    },
    useLinkPreview(url: string | null) {
        return useQuery<LinkPreview | null>({
            queryKey: ["chat-link-preview", url],
            queryFn: async () => {
                if (!url) {
                    return null;
                }

                const token = getSessionToken();
                const params = new URLSearchParams({
                    url,
                });
                const res = await fetch(
                    buildApiUrl(`/chat/link-preview?${params}`),
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!res.ok) {
                    return null;
                }

                const data: LinkPreview = await res.json();
                return data;
            },
            enabled: Boolean(url),
            retry: false,
            staleTime: 30 * 60_000,
            gcTime: 2 * 60 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        });
    },
    useRealtime(roomKey = DEFAULT_ROOM_KEY, currentUserId?: number) {
        const queryClient = useQueryClient();
        const [onlineUsers, setOnlineUsers] = React.useState<ChatMessageUser[]>(
            [],
        );
        const [typingUsers, setTypingUsers] = React.useState<ChatMessageUser[]>(
            [],
        );
        const typingTimeoutsRef = React.useRef(
            new Map<number, ReturnType<typeof window.setTimeout>>(),
        );

        React.useEffect(() => {
            const token = localStorage.getItem("session_token");

            if (!token) {
                disconnectChatSocket();
                setOnlineUsers([]);
                setTypingUsers([]);
                return;
            }

            const socket = getChatSocket(token);
            const typingTimeouts = typingTimeoutsRef.current;

            const clearTypingUser = (userId: number) => {
                const timeoutId = typingTimeouts.get(userId);

                if (timeoutId) {
                    window.clearTimeout(timeoutId);
                }

                typingTimeouts.delete(userId);
                setTypingUsers((currentUsers) => {
                    return currentUsers.filter((user) => user.id !== userId);
                });
            };

            const handleMessage = (message: ChatMessage) => {
                if (message.room_key !== roomKey) {
                    return;
                }

                queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
                    ["chat-messages", roomKey],
                    (currentData) => {
                        return appendChatMessage(currentData, message);
                    },
                );
            };

            const handleMessageUpdate = (message: ChatMessage) => {
                if (message.room_key !== roomKey) {
                    return;
                }

                queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
                    ["chat-messages", roomKey],
                    (currentData) => {
                        return updateChatMessage(currentData, message);
                    },
                );
            };

            const handleMessageDelete = (event: ChatMessageDeleteEvent) => {
                if (event.roomKey !== roomKey) {
                    return;
                }

                queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
                    ["chat-messages", roomKey],
                    (currentData) => {
                        return removeChatMessage(currentData, event.messageId);
                    },
                );
            };

            const handleReactionUpdate = (
                reactionUpdate: ChatReactionUpdate,
            ) => {
                queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
                    ["chat-messages", roomKey],
                    (currentData) => {
                        return updateChatMessageReactions(
                            currentData,
                            reactionUpdate,
                        );
                    },
                );
            };

            const handleReadReceiptUpdate = (
                readReceiptUpdate: ChatReadReceiptUpdate,
            ) => {
                if (readReceiptUpdate.roomKey !== roomKey) {
                    return;
                }

                queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
                    ["chat-messages", roomKey],
                    (currentData) => {
                        return updateChatMessageReadReceipts(
                            currentData,
                            readReceiptUpdate,
                        );
                    },
                );
            };

            const handlePresenceUpdate = (event: ChatPresenceUpdate) => {
                if (event.roomKey !== roomKey) {
                    return;
                }

                setOnlineUsers(event.users);
            };

            const handleTypingUpdate = (event: ChatTypingEvent) => {
                if (
                    event.roomKey !== roomKey ||
                    event.user.id === currentUserId
                ) {
                    return;
                }

                if (!event.isTyping) {
                    clearTypingUser(event.user.id);
                    return;
                }

                setTypingUsers((currentUsers) => {
                    const otherUsers = currentUsers.filter((user) => {
                        return user.id !== event.user.id;
                    });

                    return [...otherUsers, event.user];
                });

                const existingTimeout = typingTimeouts.get(event.user.id);

                if (existingTimeout) {
                    window.clearTimeout(existingTimeout);
                }

                const timeoutId = window.setTimeout(() => {
                    clearTypingUser(event.user.id);
                }, TYPING_IDLE_TIMEOUT_MS);

                typingTimeouts.set(event.user.id, timeoutId);
            };

            socket.on("chat:message:new", handleMessage);
            socket.on("chat:message:update", handleMessageUpdate);
            socket.on("chat:message:delete", handleMessageDelete);
            socket.on("chat:reaction:update", handleReactionUpdate);
            socket.on("chat:read:update", handleReadReceiptUpdate);
            socket.on("chat:presence:update", handlePresenceUpdate);
            socket.on("chat:typing:update", handleTypingUpdate);
            ensureChatSocketConnected(token);

            return () => {
                socket.off("chat:message:new", handleMessage);
                socket.off("chat:message:update", handleMessageUpdate);
                socket.off("chat:message:delete", handleMessageDelete);
                socket.off("chat:reaction:update", handleReactionUpdate);
                socket.off("chat:read:update", handleReadReceiptUpdate);
                socket.off("chat:presence:update", handlePresenceUpdate);
                socket.off("chat:typing:update", handleTypingUpdate);
                typingTimeouts.forEach((timeoutId) => {
                    window.clearTimeout(timeoutId);
                });
                typingTimeouts.clear();
            };
        }, [currentUserId, queryClient, roomKey]);

        const startTyping = React.useCallback(() => {
            const token = localStorage.getItem("session_token");

            if (!token) {
                return;
            }

            ensureChatSocketConnected(token).emit("chat:typing:start", {
                roomKey,
            });
        }, [roomKey]);

        const stopTyping = React.useCallback(() => {
            const token = localStorage.getItem("session_token");

            if (!token) {
                return;
            }

            ensureChatSocketConnected(token).emit("chat:typing:stop", {
                roomKey,
            });
        }, [roomKey]);

        return {
            onlineUsers,
            typingUsers,
            startTyping,
            stopTyping,
        };
    },
    useSendMessage(roomKey = DEFAULT_ROOM_KEY) {
        const queryClient = useQueryClient();

        return useMutation({
            mutationKey: ["send-chat-message", roomKey],
            mutationFn: async ({
                roomKey: inputRoomKey,
                messageType = "text",
                body,
                mediaProvider,
                mediaId,
                mediaUrl,
            }: SendChatMessageInput) => {
                const token = getSessionToken();
                const res = await fetch(buildApiUrl("/chat/messages"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        roomKey: inputRoomKey ?? roomKey,
                        messageType,
                        body,
                        mediaProvider,
                        mediaId,
                        mediaUrl,
                    }),
                });

                if (!res.ok) {
                    const errorBody = (await res.json().catch(() => null)) as {
                        error?: string;
                    } | null;

                    throw new Error(
                        errorBody?.error ?? "Failed to send chat message",
                    );
                }

                const data: ChatMessage = await res.json();
                return data;
            },
            onSuccess: (message, variables) => {
                queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
                    ["chat-messages", variables.roomKey ?? roomKey],
                    (currentData) => {
                        return appendChatMessage(currentData, message);
                    },
                );
            },
        });
    },
    useUploadImage(roomKey = DEFAULT_ROOM_KEY) {
        return useMutation({
            mutationKey: ["upload-chat-image", roomKey],
            mutationFn: async ({
                roomKey: inputRoomKey,
                file,
            }: UploadChatImageInput) => {
                if (!file.type.startsWith("image/")) {
                    throw new Error("Only image files can be uploaded");
                }

                const token = getSessionToken();
                const dataUrl = await readFileAsDataUrl(file);
                const res = await fetch(buildApiUrl("/chat/uploads/image"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        roomKey: inputRoomKey ?? roomKey,
                        dataUrl,
                    }),
                });

                if (!res.ok) {
                    const errorBody = (await res.json().catch(() => null)) as {
                        error?: string;
                    } | null;

                    throw new Error(
                        errorBody?.error ?? "Failed to upload chat image",
                    );
                }

                const data: UploadedChatImage = await res.json();
                return data;
            },
        });
    },
    useUpdateMessage(roomKey = DEFAULT_ROOM_KEY) {
        const queryClient = useQueryClient();

        return useMutation({
            mutationKey: ["update-chat-message", roomKey],
            mutationFn: async ({ messageId, body }: UpdateChatMessageInput) => {
                const token = getSessionToken();
                const res = await fetch(
                    buildApiUrl(`/chat/messages/${messageId}`),
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            body,
                        }),
                    },
                );

                if (!res.ok) {
                    const errorBody = (await res.json().catch(() => null)) as {
                        error?: string;
                    } | null;

                    throw new Error(
                        errorBody?.error ?? "Failed to update chat message",
                    );
                }

                const data: ChatMessage = await res.json();
                return data;
            },
            onSuccess: (message) => {
                queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
                    ["chat-messages", message.room_key ?? roomKey],
                    (currentData) => {
                        return updateChatMessage(currentData, message);
                    },
                );
            },
        });
    },
    useDeleteMessage(roomKey = DEFAULT_ROOM_KEY) {
        const queryClient = useQueryClient();

        return useMutation({
            mutationKey: ["delete-chat-message", roomKey],
            mutationFn: async ({ messageId }: DeleteChatMessageInput) => {
                const token = getSessionToken();
                const res = await fetch(
                    buildApiUrl(`/chat/messages/${messageId}`),
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!res.ok) {
                    const errorBody = (await res.json().catch(() => null)) as {
                        error?: string;
                    } | null;

                    throw new Error(
                        errorBody?.error ?? "Failed to delete chat message",
                    );
                }

                const data: ChatMessageDeleteEvent = await res.json();
                return data;
            },
            onSuccess: (event) => {
                queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
                    ["chat-messages", event.roomKey ?? roomKey],
                    (currentData) => {
                        return removeChatMessage(currentData, event.messageId);
                    },
                );
            },
        });
    },
    useToggleReaction(roomKey = DEFAULT_ROOM_KEY) {
        const queryClient = useQueryClient();

        return useMutation({
            mutationKey: ["toggle-chat-reaction", roomKey],
            mutationFn: async ({
                messageId,
                reactionType,
            }: ToggleChatReactionInput) => {
                const token = getSessionToken();
                const res = await fetch(
                    buildApiUrl(`/chat/messages/${messageId}/reactions`),
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            reactionType,
                        }),
                    },
                );

                if (!res.ok) {
                    const errorBody = (await res.json().catch(() => null)) as {
                        error?: string;
                    } | null;

                    throw new Error(
                        errorBody?.error ?? "Failed to update reaction",
                    );
                }

                const data: ChatReactionUpdate = await res.json();
                return data;
            },
            onSuccess: (reactionUpdate) => {
                queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
                    ["chat-messages", roomKey],
                    (currentData) => {
                        return updateChatMessageReactions(
                            currentData,
                            reactionUpdate,
                        );
                    },
                );
            },
        });
    },
    useMarkReadReceipt(roomKey = DEFAULT_ROOM_KEY) {
        const queryClient = useQueryClient();

        return useMutation({
            mutationKey: ["chat-read-receipt", roomKey],
            mutationFn: async ({
                roomKey: inputRoomKey,
                messageId,
            }: MarkChatReadReceiptInput) => {
                const token = getSessionToken();
                const res = await fetch(buildApiUrl("/chat/read-receipts"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        roomKey: inputRoomKey ?? roomKey,
                        messageId,
                    }),
                });

                if (!res.ok) {
                    const errorBody = (await res.json().catch(() => null)) as {
                        error?: string;
                    } | null;

                    throw new Error(
                        errorBody?.error ??
                            "Failed to update read receipt status",
                    );
                }

                const data: ChatReadReceiptUpdate = await res.json();
                return data;
            },
            onSuccess: (readReceiptUpdate) => {
                queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
                    ["chat-messages", readReceiptUpdate.roomKey ?? roomKey],
                    (currentData) => {
                        return updateChatMessageReadReceipts(
                            currentData,
                            readReceiptUpdate,
                        );
                    },
                );
            },
        });
    },
};

export default ChatService;
