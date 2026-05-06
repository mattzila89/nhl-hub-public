import { Box } from "@mui/material";
import { useAuth } from "../../../../../../../AuthProvider";
import type { ChatMessage } from "../../../../../../../interfaces";
import ChatService from "../../../../../../services/ChatService";
import type { GiphyGif } from "../../../../../../services/GiphyService";
import ChatComposer from "../composer/ChatComposer";
import ChatGoalOverlay from "../goal/ChatGoalOverlay";
import ChatImageDropOverlay from "./components/ChatImageDropOverlay";
import ChatMessagesList from "./components/ChatMessagesList";
import ChatNewMessagesButton from "./components/ChatNewMessagesButton";
import ChatPanelHeader from "./components/ChatPanelHeader";
import ChatTypingIndicator from "./components/ChatTypingIndicator";
import useChatGoalOverlay from "../goal/hooks/useChatGoalOverlay";
import useChatImageDrop from "./hooks/useChatImageDrop";
import useChatMentionUsers from "./hooks/useChatMentionUsers";
import useChatNotificationSound from "./hooks/useChatNotificationSound";
import useChatPanelScroll from "./hooks/useChatPanelScroll";
import useChatTypingComposer from "./hooks/useChatTypingComposer";
import useChatUnreadCount from "./hooks/useChatUnreadCount";

type ChatPanelProps = {
    chatOpen: boolean;
    onClose: () => void;
    onUnreadCountChange: (count: number) => void;
};

const ChatPanel = ({
    chatOpen,
    onClose,
    onUnreadCountChange,
}: ChatPanelProps) => {
    const { user } = useAuth();
    const messagesQuery = ChatService.useMessages();
    const chatUsersQuery = ChatService.useUsers();
    const messagePages: Array<{ messages: ChatMessage[] }> =
        messagesQuery.data?.pages ?? [];
    const messages: ChatMessage[] = messagePages.flatMap((page) => {
        return page.messages;
    });
    const latestMessage = messages.at(-1) ?? null;
    const latestMessageId = latestMessage?.id ?? null;
    const latestMessageType = latestMessage?.message_type ?? null;
    const latestMessageGoalAnimationCode =
        latestMessage?.user?.selected_team?.goalAnimationCode?.trim() ?? "";
    const { onlineUsers, typingUsers, startTyping, stopTyping } =
        ChatService.useRealtime("global", user?.id);
    const sendMessageMutation = ChatService.useSendMessage();
    const uploadImageMutation = ChatService.useUploadImage();
    const updateMessageMutation = ChatService.useUpdateMessage();
    const deleteMessageMutation = ChatService.useDeleteMessage();
    const toggleReactionMutation = ChatService.useToggleReaction();
    const markReadReceiptMutation = ChatService.useMarkReadReceipt();
    const {
        messageInput,
        setMessageInput,
        updateMessageInput,
        clearTypingState,
    } = useChatTypingComposer({
        startTyping,
        stopTyping,
    });
    const { knownMentionUsers, mentionSuggestionUsers } = useChatMentionUsers({
        chatUsers: chatUsersQuery.data,
        currentUser: user,
        messages,
        onlineUsers,
    });
    const {
        clearDroppedImageFile,
        droppedImageFile,
        isImageDragActive,
        onDragEnter,
        onDragLeave,
        onDragOver,
        onDrop,
    } = useChatImageDrop({
        disabled:
            sendMessageMutation.isPending || uploadImageMutation.isPending,
    });
    const { activeGoalOverlay, dismissGoalOverlay } = useChatGoalOverlay({
        isLoading: messagesQuery.isLoading,
        latestMessageGoalAnimationCode,
        latestMessageId,
        latestMessageType,
    });

    useChatNotificationSound({
        chatOpen,
        currentUserId: user?.id,
        isLoading: messagesQuery.isLoading,
        latestMessage,
        latestMessageId,
    });
    const {
        bottomRef,
        handleMessagesScroll,
        handleNewMessageBarClick,
        newMessageCount,
        scrollContainerRef,
    } = useChatPanelScroll({
        chatOpen,
        currentUserId: user?.id,
        fetchPreviousPage: messagesQuery.fetchPreviousPage,
        hasPreviousPage: messagesQuery.hasPreviousPage,
        isFetchPreviousPageError: messagesQuery.isFetchPreviousPageError,
        isFetchingPreviousPage: messagesQuery.isFetchingPreviousPage,
        isLoading: messagesQuery.isLoading,
        latestMessageId,
        markReadReceipt: markReadReceiptMutation.mutate,
        messages,
    });

    useChatUnreadCount({
        chatOpen,
        currentUserId: user?.id,
        messages,
        onUnreadCountChange,
    });

    const handleSend = async () => {
        const value = messageInput.trim();

        if (!value) {
            return;
        }

        try {
            await sendMessageMutation.mutateAsync({
                messageType: "text",
                body: value,
            });

            clearTypingState();
            setMessageInput("");
        } catch {
            // Mutation error state drives the UI.
        }
    };

    const handleSendSiren = async () => {
        try {
            clearTypingState();
            await sendMessageMutation.mutateAsync({
                messageType: "siren",
            });
        } catch {
            // Mutation error state drives the UI.
        }
    };

    const handleSendGif = async (gif: GiphyGif) => {
        await sendMessageMutation.mutateAsync({
            messageType: "gif",
            mediaProvider: "giphy",
            mediaId: gif.id,
            mediaUrl: gif.url,
        });

        if (messageInput.trim() === "") {
            clearTypingState();
        }
    };

    const handleSendImage = async (file: File) => {
        if (sendMessageMutation.isPending || uploadImageMutation.isPending) {
            return;
        }

        const uploadedImage = await uploadImageMutation.mutateAsync({
            file,
        });

        await sendMessageMutation.mutateAsync({
            messageType: "image",
            mediaProvider: uploadedImage.provider,
            mediaId: uploadedImage.mediaId,
            mediaUrl: uploadedImage.mediaUrl,
        });

        if (messageInput.trim() === "") {
            clearTypingState();
        }
    };

    const handleEditMessage = async (messageId: number, body: string) => {
        await updateMessageMutation.mutateAsync({
            messageId,
            body,
        });
    };

    const handleDeleteMessage = async (messageId: number) => {
        await deleteMessageMutation.mutateAsync({
            messageId,
        });
    };

    return (
        <Box
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            sx={{
                position: "relative",
                isolation: "isolate",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                color: "#ffffff",
                // backgroundImage: `url(${user?.selected_team?.wallpaper})`,
                backgroundImage:
                    "url('https://zxjfbybflcnjgjcazcoy.supabase.co/storage/v1/object/public/chat_wallpapers/stanley_cup.png')",
                backgroundPosition: "center, center 58%",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
            }}
            data-testid="chat-panel"
        >
            {activeGoalOverlay && (
                <ChatGoalOverlay
                    overlayKey={activeGoalOverlay.messageId}
                    videoCode={activeGoalOverlay.videoCode}
                    onClose={dismissGoalOverlay}
                />
            )}

            {isImageDragActive && <ChatImageDropOverlay />}

            <ChatPanelHeader
                currentUserId={user?.id}
                onlineUsers={onlineUsers}
                onClose={onClose}
            />

            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    position: "relative",
                }}
            >
                <Box
                    ref={scrollContainerRef}
                    onScroll={handleMessagesScroll}
                    sx={{
                        boxSizing: "border-box",
                        height: "100%",
                        overflowY: "auto",
                        p: 1.5,
                    }}
                >
                    <ChatMessagesList
                        bottomRef={bottomRef}
                        currentUser={user}
                        deletingMessageId={
                            deleteMessageMutation.isPending
                                ? (deleteMessageMutation.variables?.messageId ??
                                  null)
                                : null
                        }
                        editingMessageId={
                            updateMessageMutation.isPending
                                ? (updateMessageMutation.variables?.messageId ??
                                  null)
                                : null
                        }
                        hasMessagesError={messagesQuery.isError}
                        isFetchPreviousPageError={
                            messagesQuery.isFetchPreviousPageError
                        }
                        isFetchingPreviousPage={
                            messagesQuery.isFetchingPreviousPage
                        }
                        isLoading={messagesQuery.isLoading}
                        knownMentionUsers={knownMentionUsers}
                        messages={messages}
                        onDeleteMessage={handleDeleteMessage}
                        onEditMessage={handleEditMessage}
                        onFetchPreviousPage={() => {
                            void messagesQuery.fetchPreviousPage();
                        }}
                        onToggleReaction={(messageId, reactionType) => {
                            toggleReactionMutation.mutate({
                                messageId,
                                reactionType,
                            });
                        }}
                    />
                </Box>

                <ChatNewMessagesButton
                    count={newMessageCount}
                    onClick={handleNewMessageBarClick}
                />
            </Box>

            <ChatTypingIndicator typingUsers={typingUsers} />

            <ChatComposer
                messageInput={messageInput}
                mentionUsers={mentionSuggestionUsers}
                sendMessageMutation={sendMessageMutation}
                imageUploadPending={uploadImageMutation.isPending}
                imageUploadError={
                    uploadImageMutation.isError &&
                    uploadImageMutation.error instanceof Error
                        ? uploadImageMutation.error
                        : null
                }
                onInputChange={updateMessageInput}
                onSend={() => {
                    void handleSend();
                }}
                onSendSiren={() => {
                    void handleSendSiren();
                }}
                onSendGif={handleSendGif}
                onSendImage={handleSendImage}
                droppedImageFile={droppedImageFile}
                onDroppedImageConsumed={clearDroppedImageFile}
            />
        </Box>
    );
};

export default ChatPanel;
