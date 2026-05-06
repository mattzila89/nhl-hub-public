import * as React from "react";
import type { ChatMessage } from "../../../../../../../../interfaces";

type UseChatUnreadCountOptions = {
    chatOpen: boolean;
    currentUserId?: number;
    messages?: ChatMessage[];
    onUnreadCountChange: (count: number) => void;
};

const useChatUnreadCount = ({
    chatOpen,
    currentUserId,
    messages,
    onUnreadCountChange,
}: UseChatUnreadCountOptions) => {
    const lastSeenMessageIdRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        lastSeenMessageIdRef.current = null;
        onUnreadCountChange(0);
    }, [currentUserId, onUnreadCountChange]);

    React.useEffect(() => {
        if (!messages?.length) {
            onUnreadCountChange(0);
            return;
        }

        const latestMessageId = messages.at(-1)?.id ?? null;

        if (latestMessageId === null) {
            onUnreadCountChange(0);
            return;
        }

        if (lastSeenMessageIdRef.current === null) {
            lastSeenMessageIdRef.current = latestMessageId;
            onUnreadCountChange(0);
            return;
        }

        if (chatOpen) {
            lastSeenMessageIdRef.current = latestMessageId;
            onUnreadCountChange(0);
            return;
        }

        const unreadCount = messages.filter((message) => {
            return (
                message.id > lastSeenMessageIdRef.current! &&
                message.user_id !== currentUserId
            );
        }).length;

        onUnreadCountChange(unreadCount);
    }, [chatOpen, currentUserId, messages, onUnreadCountChange]);
};

export default useChatUnreadCount;
