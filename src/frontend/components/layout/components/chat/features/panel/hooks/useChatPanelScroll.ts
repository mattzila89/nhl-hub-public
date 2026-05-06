import * as React from "react";
import type { ChatMessage, ChatReadReceiptUpdate } from "../../../../../../../../interfaces";

type MarkReadReceiptMutate = (
    input: { messageId: number },
    options: {
        onSuccess: (readReceiptUpdate: ChatReadReceiptUpdate) => void;
        onError: () => void;
    },
) => void;

type UseChatPanelScrollInput = {
    chatOpen: boolean;
    currentUserId?: number;
    fetchPreviousPage: () => Promise<unknown> | void;
    hasPreviousPage?: boolean;
    isFetchPreviousPageError?: boolean;
    isFetchingPreviousPage?: boolean;
    isLoading?: boolean;
    latestMessageId: number | null;
    markReadReceipt: MarkReadReceiptMutate;
    messages: ChatMessage[];
};

const useChatPanelScroll = ({
    chatOpen,
    currentUserId,
    fetchPreviousPage,
    hasPreviousPage = false,
    isFetchPreviousPageError = false,
    isFetchingPreviousPage = false,
    isLoading = false,
    latestMessageId,
    markReadReceipt,
    messages,
}: UseChatPanelScrollInput) => {
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
    const bottomRef = React.useRef<HTMLDivElement | null>(null);
    const hasScrolledToBottomRef = React.useRef(false);
    const shouldStickToBottomRef = React.useRef(true);
    const scrollToBottomFrameRef = React.useRef<number | null>(null);
    const newMessageCountTimeoutRef = React.useRef<number | null>(null);
    const previousScrollMetricsRef = React.useRef<{
        scrollHeight: number;
        scrollTop: number;
    } | null>(null);
    const previousLatestMessageIdRef = React.useRef<number | null>(null);
    const newMessagesReadThroughIdRef = React.useRef<number | null>(null);
    const acknowledgedReadReceiptMessageIdRef = React.useRef<number | null>(
        null,
    );
    const pendingReadReceiptMessageIdRef = React.useRef<number | null>(null);
    const [newMessageCount, setNewMessageCount] = React.useState(0);

    const scheduleNewMessageCount = React.useCallback((count: number) => {
        if (newMessageCountTimeoutRef.current !== null) {
            window.clearTimeout(newMessageCountTimeoutRef.current);
        }

        newMessageCountTimeoutRef.current = window.setTimeout(() => {
            newMessageCountTimeoutRef.current = null;
            setNewMessageCount(count);
        }, 0);
    }, []);

    const scrollToBottom = React.useCallback((defer = false) => {
        const applyScroll = () => {
            const container = scrollContainerRef.current;

            if (!container) {
                return;
            }

            container.scrollTop = container.scrollHeight;
        };

        if (!defer) {
            applyScroll();
            return;
        }

        if (scrollToBottomFrameRef.current !== null) {
            window.cancelAnimationFrame(scrollToBottomFrameRef.current);
        }

        scrollToBottomFrameRef.current = window.requestAnimationFrame(() => {
            scrollToBottomFrameRef.current = null;
            applyScroll();
        });
    }, []);

    const submitReadReceipt = React.useCallback(
        (messageId: number | null) => {
            if (
                !chatOpen ||
                currentUserId === undefined ||
                messageId === null ||
                !Number.isInteger(messageId) ||
                messageId <= 0 ||
                document.visibilityState !== "visible"
            ) {
                return;
            }

            const lastAcknowledgedMessageId =
                acknowledgedReadReceiptMessageIdRef.current ?? 0;
            const pendingMessageId = pendingReadReceiptMessageIdRef.current ?? 0;
            const nextReadMessageId = messageId;

            if (
                nextReadMessageId <= lastAcknowledgedMessageId ||
                nextReadMessageId <= pendingMessageId
            ) {
                return;
            }

            pendingReadReceiptMessageIdRef.current = nextReadMessageId;
            markReadReceipt(
                {
                    messageId: nextReadMessageId,
                },
                {
                    onSuccess: (readReceiptUpdate) => {
                        const resolvedMessageId =
                            readReceiptUpdate.readReceipt
                                ?.last_read_message_id ?? nextReadMessageId;

                        acknowledgedReadReceiptMessageIdRef.current = Math.max(
                            acknowledgedReadReceiptMessageIdRef.current ?? 0,
                            resolvedMessageId,
                        );

                        if (
                            pendingReadReceiptMessageIdRef.current ===
                            nextReadMessageId
                        ) {
                            pendingReadReceiptMessageIdRef.current = null;
                        }
                    },
                    onError: () => {
                        if (
                            pendingReadReceiptMessageIdRef.current ===
                            nextReadMessageId
                        ) {
                            pendingReadReceiptMessageIdRef.current = null;
                        }
                    },
                },
            );
        },
        [chatOpen, currentUserId, markReadReceipt],
    );

    const markVisibleMessagesRead = React.useCallback(() => {
        if (newMessageCountTimeoutRef.current !== null) {
            window.clearTimeout(newMessageCountTimeoutRef.current);
            newMessageCountTimeoutRef.current = null;
        }

        newMessagesReadThroughIdRef.current = latestMessageId;
        setNewMessageCount(0);
        submitReadReceipt(latestMessageId);
    }, [latestMessageId, submitReadReceipt]);

    const handleNewMessageBarClick = React.useCallback(() => {
        shouldStickToBottomRef.current = true;
        markVisibleMessagesRead();
        scrollToBottom(true);
    }, [markVisibleMessagesRead, scrollToBottom]);

    React.useEffect(() => {
        acknowledgedReadReceiptMessageIdRef.current = null;
        pendingReadReceiptMessageIdRef.current = null;
    }, [currentUserId]);

    React.useEffect(() => {
        if (isLoading) {
            return;
        }

        if (latestMessageId === null) {
            newMessagesReadThroughIdRef.current = null;
            scheduleNewMessageCount(0);
            return;
        }

        if (newMessagesReadThroughIdRef.current === null) {
            newMessagesReadThroughIdRef.current = latestMessageId;
            scheduleNewMessageCount(0);
            return;
        }

        if (!chatOpen || shouldStickToBottomRef.current) {
            newMessagesReadThroughIdRef.current = latestMessageId;
            scheduleNewMessageCount(0);
            return;
        }

        const nextNewMessageCount = messages.filter((message) => {
            return (
                message.id > newMessagesReadThroughIdRef.current! &&
                message.user_id !== currentUserId
            );
        }).length;

        scheduleNewMessageCount(nextNewMessageCount);
    }, [
        chatOpen,
        currentUserId,
        isLoading,
        latestMessageId,
        messages,
        scheduleNewMessageCount,
    ]);

    React.useEffect(() => {
        if (
            !chatOpen ||
            isLoading ||
            latestMessageId === null ||
            !shouldStickToBottomRef.current
        ) {
            return;
        }

        markVisibleMessagesRead();
    }, [chatOpen, isLoading, latestMessageId, markVisibleMessagesRead]);

    React.useEffect(() => {
        if (!isFetchingPreviousPage && isFetchPreviousPageError) {
            previousScrollMetricsRef.current = null;
        }
    }, [isFetchingPreviousPage, isFetchPreviousPageError]);

    React.useEffect(() => {
        return () => {
            if (scrollToBottomFrameRef.current !== null) {
                window.cancelAnimationFrame(scrollToBottomFrameRef.current);
            }

            if (newMessageCountTimeoutRef.current !== null) {
                window.clearTimeout(newMessageCountTimeoutRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (
            !hasScrolledToBottomRef.current ||
            !shouldStickToBottomRef.current ||
            previousScrollMetricsRef.current !== null
        ) {
            return;
        }

        const container = scrollContainerRef.current;
        const content = container?.firstElementChild;

        if (!container || !content || typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver(() => {
            scrollToBottom();
        });

        observer.observe(content);

        return () => {
            observer.disconnect();
        };
    }, [messages.length, scrollToBottom]);

    React.useLayoutEffect(() => {
        const container = scrollContainerRef.current;

        if (!container || messages.length === 0) {
            return;
        }

        if (previousScrollMetricsRef.current) {
            const { scrollHeight, scrollTop } =
                previousScrollMetricsRef.current;

            container.scrollTop =
                container.scrollHeight - scrollHeight + scrollTop;
            previousScrollMetricsRef.current = null;
            previousLatestMessageIdRef.current = latestMessageId;
            return;
        }

        if (!hasScrolledToBottomRef.current) {
            shouldStickToBottomRef.current = true;
            scrollToBottom(true);
            hasScrolledToBottomRef.current = true;
            previousLatestMessageIdRef.current = latestMessageId;
            return;
        }

        if (
            latestMessageId !== previousLatestMessageIdRef.current &&
            shouldStickToBottomRef.current
        ) {
            scrollToBottom(true);
        }

        previousLatestMessageIdRef.current = latestMessageId;
    }, [latestMessageId, messages.length, scrollToBottom]);

    const handleMessagesScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const container = event.currentTarget;
        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        shouldStickToBottomRef.current = distanceFromBottom <= 72;

        if (shouldStickToBottomRef.current) {
            markVisibleMessagesRead();
        }

        if (
            container.scrollTop > 120 ||
            !hasPreviousPage ||
            isFetchingPreviousPage ||
            previousScrollMetricsRef.current !== null
        ) {
            return;
        }

        previousScrollMetricsRef.current = {
            scrollHeight: container.scrollHeight,
            scrollTop: container.scrollTop,
        };

        void fetchPreviousPage();
    };

    return {
        bottomRef,
        newMessageCount,
        scrollContainerRef,
        handleMessagesScroll,
        handleNewMessageBarClick,
    };
};

export default useChatPanelScroll;
