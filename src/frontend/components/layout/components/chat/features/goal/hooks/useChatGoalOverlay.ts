import * as React from "react";

type GoalOverlayState = {
    messageId: number;
    videoCode: string;
};

type UseChatGoalOverlayInput = {
    isLoading?: boolean;
    latestMessageGoalAnimationCode: string;
    latestMessageId: number | null;
    latestMessageType: string | null;
};

const CHAT_GOAL_OVERLAY_DURATION_MS = 45000;

const useChatGoalOverlay = ({
    isLoading = false,
    latestMessageGoalAnimationCode,
    latestMessageId,
    latestMessageType,
}: UseChatGoalOverlayInput) => {
    const goalOverlayStartTimeoutRef = React.useRef<number | null>(null);
    const goalOverlayTimeoutRef = React.useRef<number | null>(null);
    const hasInitializedLatestMessageRef = React.useRef(false);
    const latestObservedMessageIdRef = React.useRef<number | null>(null);
    const [activeGoalOverlay, setActiveGoalOverlay] =
        React.useState<GoalOverlayState | null>(null);

    const dismissGoalOverlay = React.useCallback(() => {
        if (goalOverlayStartTimeoutRef.current !== null) {
            window.clearTimeout(goalOverlayStartTimeoutRef.current);
            goalOverlayStartTimeoutRef.current = null;
        }

        if (goalOverlayTimeoutRef.current !== null) {
            window.clearTimeout(goalOverlayTimeoutRef.current);
            goalOverlayTimeoutRef.current = null;
        }

        setActiveGoalOverlay(null);
    }, []);

    React.useEffect(() => {
        return () => {
            if (goalOverlayStartTimeoutRef.current !== null) {
                window.clearTimeout(goalOverlayStartTimeoutRef.current);
            }

            if (goalOverlayTimeoutRef.current !== null) {
                window.clearTimeout(goalOverlayTimeoutRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!hasInitializedLatestMessageRef.current) {
            hasInitializedLatestMessageRef.current = true;
            latestObservedMessageIdRef.current = latestMessageId;
            return;
        }

        if (latestMessageId === null) {
            return;
        }

        const previousObservedMessageId = latestObservedMessageIdRef.current;

        if (
            previousObservedMessageId !== null &&
            latestMessageId <= previousObservedMessageId
        ) {
            return;
        }

        latestObservedMessageIdRef.current = latestMessageId;

        if (
            latestMessageType !== "siren" ||
            latestMessageGoalAnimationCode.length === 0
        ) {
            return;
        }

        if (goalOverlayTimeoutRef.current !== null) {
            window.clearTimeout(goalOverlayTimeoutRef.current);
        }

        if (goalOverlayStartTimeoutRef.current !== null) {
            window.clearTimeout(goalOverlayStartTimeoutRef.current);
        }

        goalOverlayStartTimeoutRef.current = window.setTimeout(() => {
            goalOverlayStartTimeoutRef.current = null;
            setActiveGoalOverlay({
                messageId: latestMessageId,
                videoCode: latestMessageGoalAnimationCode,
            });

            goalOverlayTimeoutRef.current = window.setTimeout(() => {
                setActiveGoalOverlay((currentOverlay) => {
                    if (currentOverlay?.messageId !== latestMessageId) {
                        return currentOverlay;
                    }

                    return null;
                });
                goalOverlayTimeoutRef.current = null;
            }, CHAT_GOAL_OVERLAY_DURATION_MS);
        }, 0);
    }, [
        isLoading,
        latestMessageGoalAnimationCode,
        latestMessageId,
        latestMessageType,
    ]);

    return {
        activeGoalOverlay,
        dismissGoalOverlay,
    };
};

export default useChatGoalOverlay;
