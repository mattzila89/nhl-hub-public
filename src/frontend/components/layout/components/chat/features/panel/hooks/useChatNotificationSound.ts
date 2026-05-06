import * as React from "react";
import type { ChatMessage } from "../../../../../../../../interfaces";

import playChatNotificationSound from "../utils/playChatNotificationSound";

type UseChatNotificationSoundInput = {
    chatOpen: boolean;
    currentUserId?: number;
    isLoading?: boolean;
    latestMessage: ChatMessage | null;
    latestMessageId: number | null;
};

const useChatNotificationSound = ({
    chatOpen,
    currentUserId,
    isLoading = false,
    latestMessage,
    latestMessageId,
}: UseChatNotificationSoundInput) => {
    const hasInitializedNotificationRef = React.useRef(false);
    const latestNotifiedMessageIdRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!hasInitializedNotificationRef.current) {
            hasInitializedNotificationRef.current = true;
            latestNotifiedMessageIdRef.current = latestMessageId;
            return;
        }

        if (latestMessageId === null) {
            return;
        }

        if (
            latestNotifiedMessageIdRef.current !== null &&
            latestMessageId <= latestNotifiedMessageIdRef.current
        ) {
            return;
        }

        latestNotifiedMessageIdRef.current = latestMessageId;

        if (latestMessage?.user_id === currentUserId) {
            return;
        }

        const shouldPlayNotificationSound =
            !chatOpen ||
            document.visibilityState !== "visible" ||
            !document.hasFocus();

        if (!shouldPlayNotificationSound) {
            return;
        }

        void playChatNotificationSound();
    }, [chatOpen, currentUserId, isLoading, latestMessage, latestMessageId]);
};

export default useChatNotificationSound;
