import * as React from "react";

type UseChatTypingComposerOptions = {
    startTyping: () => void;
    stopTyping: () => void;
};

const STOP_TYPING_DELAY_MS = 1500;

const useChatTypingComposer = ({
    startTyping,
    stopTyping,
}: UseChatTypingComposerOptions) => {
    const [messageInput, setMessageInput] = React.useState("");
    const isTypingRef = React.useRef(false);
    const stopTypingTimeoutRef = React.useRef<ReturnType<
        typeof window.setTimeout
    > | null>(null);

    const clearTypingState = React.useCallback(() => {
        if (stopTypingTimeoutRef.current) {
            window.clearTimeout(stopTypingTimeoutRef.current);
            stopTypingTimeoutRef.current = null;
        }

        if (!isTypingRef.current) {
            return;
        }

        isTypingRef.current = false;
        stopTyping();
    }, [stopTyping]);

    React.useEffect(() => {
        return () => {
            if (stopTypingTimeoutRef.current) {
                window.clearTimeout(stopTypingTimeoutRef.current);
            }

            if (isTypingRef.current) {
                stopTyping();
            }
        };
    }, [stopTyping]);

    const updateMessageInput = (value: string) => {
        setMessageInput(value);

        if (value.trim() === "") {
            clearTypingState();
            return;
        }

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            startTyping();
        }

        if (stopTypingTimeoutRef.current) {
            window.clearTimeout(stopTypingTimeoutRef.current);
        }

        stopTypingTimeoutRef.current = window.setTimeout(() => {
            isTypingRef.current = false;
            stopTyping();
            stopTypingTimeoutRef.current = null;
        }, STOP_TYPING_DELAY_MS);
    };

    return {
        messageInput,
        setMessageInput,
        updateMessageInput,
        clearTypingState,
    };
};

export default useChatTypingComposer;
