import {
    Alert,
    Box,
    Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { UseMutationResult } from "@tanstack/react-query";
import type {
    ChatMessage,
    ChatMessageType,
    ChatMessageUser,
} from "../../../../../../../interfaces";
import ChatComposerDraftImage from "./components/ChatComposerDraftImage";
import ChatComposerTextInput from "./components/ChatComposerTextInput";
import ChatMentionChip from "../chat-mentions/components/ChatMentionChip";
import ChatMentionSuggestionsPopper from "../chat-mentions/components/ChatMentionSuggestionsPopper";
import type { GiphyGif } from "../../../../../../services/GiphyService";
import React from "react";
import { isSupportedImageFile } from "../../utils/chatImageFiles";
import {
    extractChatMentionChip,
    getActiveChatMention,
    getChatMentionSuggestions,
    type ChatMentionSuggestion,
} from "../chat-mentions/utils/chatMentions";

type SendChatMessageInput = {
    roomKey?: string;
    messageType?: ChatMessageType;
    body?: string;
    mediaProvider?: string;
    mediaId?: string;
    mediaUrl?: string;
};

type ChatComposerProps = {
    messageInput: string;
    mentionUsers?: ChatMessageUser[];
    sendMessageMutation: UseMutationResult<
        ChatMessage,
        Error,
        SendChatMessageInput
    >;
    imageUploadPending?: boolean;
    imageUploadError?: Error | null;
    droppedImageFile?: File | null;
    onInputChange: (value: string) => void;
    onSend: () => void;
    onSendSiren: () => void;
    onSendGif: (gif: GiphyGif) => Promise<void>;
    onSendImage: (file: File) => Promise<void>;
    onDroppedImageConsumed?: () => void;
};

const ChatComposer = ({
    messageInput,
    mentionUsers = [],
    sendMessageMutation,
    imageUploadPending = false,
    imageUploadError = null,
    droppedImageFile = null,
    onInputChange,
    onSend,
    onSendSiren,
    onSendGif,
    onSendImage,
    onDroppedImageConsumed,
}: ChatComposerProps) => {
    const [draftImage, setDraftImage] = React.useState<{
        file: File;
        previewUrl: string;
        displayName: string;
    } | null>(null);
    const [caretPosition, setCaretPosition] = React.useState(
        messageInput.length,
    );
    const [isTextInputFocused, setIsTextInputFocused] = React.useState(false);
    const [mentionPickerState, setMentionPickerState] = React.useState<{
        activeMentionKey: string | null;
        dismissedMentionKey: string | null;
        highlightedMentionIndex: number;
    }>({
        activeMentionKey: null,
        dismissedMentionKey: null,
        highlightedMentionIndex: 0,
    });
    const [textInputAnchorEl, setTextInputAnchorEl] = React.useState<
        HTMLInputElement | HTMLTextAreaElement | null
    >(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const textInputRef = React.useRef<
        HTMLInputElement | HTMLTextAreaElement | null
    >(null);
    const isComposerBusy = sendMessageMutation.isPending || imageUploadPending;
    const hasDraftImage = draftImage !== null;
    const sendMessageError =
        sendMessageMutation.isError &&
        sendMessageMutation.error instanceof Error
            ? sendMessageMutation.error
            : null;
    const composerError = imageUploadError ?? sendMessageError;
    const activeMention = React.useMemo(() => {
        return getActiveChatMention(messageInput, caretPosition);
    }, [caretPosition, messageInput]);
    const activeMentionKey = activeMention
        ? `${activeMention.start}:${activeMention.query}`
        : null;
    const normalizedMentionPickerState =
        mentionPickerState.activeMentionKey === activeMentionKey
            ? mentionPickerState
            : {
                  activeMentionKey,
                  dismissedMentionKey: null,
                  highlightedMentionIndex: 0,
              };
    const highlightedMentionIndex =
        normalizedMentionPickerState.highlightedMentionIndex;
    const dismissedMentionKey =
        normalizedMentionPickerState.dismissedMentionKey;
    const mentionSuggestions = React.useMemo(() => {
        if (!activeMention) {
            return [];
        }

        return getChatMentionSuggestions(mentionUsers, activeMention.query);
    }, [activeMention, mentionUsers]);
    const mentionDraftChip = React.useMemo(() => {
        return extractChatMentionChip(messageInput, mentionUsers, null);
    }, [mentionUsers, messageInput]);
    const shouldShowMentionSuggestions =
        !hasDraftImage &&
        isTextInputFocused &&
        activeMention !== null &&
        activeMentionKey !== dismissedMentionKey &&
        mentionSuggestions.length > 0;

    React.useEffect(() => {
        return () => {
            if (draftImage) {
                URL.revokeObjectURL(draftImage.previewUrl);
            }
        };
    }, [draftImage]);

    const setHighlightedMentionIndex = React.useCallback(
        (nextValue: React.SetStateAction<number>) => {
            setMentionPickerState((currentState) => {
                const baseState =
                    currentState.activeMentionKey === activeMentionKey
                        ? currentState
                        : {
                              activeMentionKey,
                              dismissedMentionKey: null,
                              highlightedMentionIndex: 0,
                          };
                const highlightedMentionIndex =
                    typeof nextValue === "function"
                        ? nextValue(baseState.highlightedMentionIndex)
                        : nextValue;

                return {
                    ...baseState,
                    highlightedMentionIndex,
                };
            });
        },
        [activeMentionKey],
    );

    const setDismissedMentionKey = React.useCallback(
        (dismissedMentionKey: string | null) => {
            setMentionPickerState((currentState) => {
                const baseState =
                    currentState.activeMentionKey === activeMentionKey
                        ? currentState
                        : {
                              activeMentionKey,
                              dismissedMentionKey: null,
                              highlightedMentionIndex: 0,
                          };

                return {
                    ...baseState,
                    dismissedMentionKey,
                };
            });
        },
        [activeMentionKey],
    );

    const handleTextInputRef = React.useCallback(
        (inputElement: HTMLInputElement | HTMLTextAreaElement | null) => {
            textInputRef.current = inputElement;
            setTextInputAnchorEl(inputElement);
        },
        [],
    );

    const syncCaretPosition = React.useCallback(() => {
        const inputElement = textInputRef.current;

        if (!inputElement) {
            setCaretPosition(messageInput.length);
            return;
        }

        setCaretPosition(inputElement.selectionStart ?? messageInput.length);
    }, [messageInput.length]);

    const focusTextInputAt = React.useCallback((cursorPosition: number) => {
        window.requestAnimationFrame(() => {
            const inputElement = textInputRef.current;

            if (!inputElement) {
                return;
            }

            inputElement.focus();
            inputElement.setSelectionRange?.(cursorPosition, cursorPosition);
            setCaretPosition(cursorPosition);
        });
    }, []);

    const insertMention = React.useCallback(
        (suggestion: ChatMentionSuggestion) => {
            const inputElement = textInputRef.current;
            const currentCursorPosition =
                inputElement?.selectionStart ?? caretPosition;
            const mentionToReplace = getActiveChatMention(
                messageInput,
                currentCursorPosition,
            );

            if (!mentionToReplace) {
                return;
            }

            const mentionText = `@${suggestion.handle} `;
            const nextValue = `${messageInput.slice(
                0,
                mentionToReplace.start,
            )}${mentionText}${messageInput.slice(mentionToReplace.end)}`;
            const nextCursorPosition =
                mentionToReplace.start + mentionText.length;

            onInputChange(nextValue);
            setDismissedMentionKey(null);
            focusTextInputAt(nextCursorPosition);
        },
        [caretPosition, focusTextInputAt, messageInput, onInputChange],
    );

    const removeMentionDraftChip = React.useCallback(() => {
        if (!mentionDraftChip) {
            return;
        }

        onInputChange(mentionDraftChip.remainingText);
        focusTextInputAt(0);
    }, [focusTextInputAt, mentionDraftChip, onInputChange]);

    const resetSelectedFile = React.useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    const clearDraftImage = React.useCallback(() => {
        setDraftImage(null);
        resetSelectedFile();
    }, [resetSelectedFile]);

    const handleDraftImageSelect = React.useCallback(
        (file: File | null) => {
            if (!file || isComposerBusy || !isSupportedImageFile(file)) {
                resetSelectedFile();
                return;
            }

            setDraftImage({
                file,
                previewUrl: URL.createObjectURL(file),
                displayName: file.name || "Pasted image",
            });
            resetSelectedFile();
        },
        [isComposerBusy, resetSelectedFile],
    );

    React.useEffect(() => {
        if (!droppedImageFile) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            handleDraftImageSelect(droppedImageFile);
            onDroppedImageConsumed?.();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [droppedImageFile, handleDraftImageSelect, onDroppedImageConsumed]);

    const handleSendDraftImage = async () => {
        if (!draftImage || isComposerBusy) {
            return;
        }

        try {
            await onSendImage(draftImage.file);
            clearDraftImage();
        } catch {
            // Mutation error state drives the UI and the draft stays visible.
        }
    };

    const handleImageInputChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0] ?? null;
        handleDraftImageSelect(file);
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        if (isComposerBusy) {
            return;
        }

        const imageItem = [...event.clipboardData.items].find((item) => {
            return item.type.startsWith("image/");
        });
        const file = imageItem?.getAsFile() ?? null;

        if (!file) {
            return;
        }

        event.preventDefault();
        handleDraftImageSelect(file);
    };

    const handleTextInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        onInputChange(event.target.value);
        setCaretPosition(
            event.target.selectionStart ?? event.target.value.length,
        );
    };

    const handleTextInputFocus = () => {
        setIsTextInputFocused(true);
        syncCaretPosition();
    };

    const handleTextInputBlur = () => {
        setIsTextInputFocused(false);
    };

    const handleTextInputKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>,
    ) => {
        if (shouldShowMentionSuggestions) {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                setHighlightedMentionIndex((currentIndex) => {
                    return (currentIndex + 1) % mentionSuggestions.length;
                });
                return;
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();
                setHighlightedMentionIndex((currentIndex) => {
                    return (
                        (currentIndex - 1 + mentionSuggestions.length) %
                        mentionSuggestions.length
                    );
                });
                return;
            }

            if (event.key === "Enter" || event.key === "Tab") {
                const highlightedMention =
                    mentionSuggestions[highlightedMentionIndex] ??
                    mentionSuggestions[0];

                if (!highlightedMention) {
                    return;
                }

                event.preventDefault();
                insertMention(highlightedMention);
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                setDismissedMentionKey(activeMentionKey);
                return;
            }
        }

        if (event.key === "Enter" && !event.shiftKey && !isComposerBusy) {
            event.preventDefault();
            onSend();
        }
    };

    const handleInsertEmoji = (emoji: string) => {
        const inputElement = textInputRef.current;

        if (!inputElement) {
            onInputChange(`${messageInput}${emoji}`);
            return;
        }

        const selectionStart =
            inputElement.selectionStart ?? messageInput.length;
        const selectionEnd = inputElement.selectionEnd ?? messageInput.length;
        const nextValue = `${messageInput.slice(0, selectionStart)}${emoji}${messageInput.slice(selectionEnd)}`;
        const nextCursorPosition = selectionStart + emoji.length;

        onInputChange(nextValue);

        window.requestAnimationFrame(() => {
            inputElement.focus();
            inputElement.setSelectionRange?.(
                nextCursorPosition,
                nextCursorPosition,
            );
        });
    };

    return (
        <Stack
            sx={{
                borderTop: `1px solid ${alpha("#ffffff", 0.14)}`,
                backgroundColor: alpha("#000", 0.5),
                backdropFilter: "blur(3px)",
                pb: "env(safe-area-inset-bottom)",
            }}
        >
            {composerError && (
                <Alert severity="error">
                    {composerError.message || "Failed to send message"}
                </Alert>
            )}

            {draftImage && (
                <ChatComposerDraftImage
                    draftImage={draftImage}
                    disabled={isComposerBusy}
                    sending={imageUploadPending}
                    onClear={clearDraftImage}
                    onSend={() => {
                        void handleSendDraftImage();
                    }}
                />
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                    handleImageInputChange(event);
                }}
            />

            {!hasDraftImage && (
                <>
                    {mentionDraftChip && (
                        <Box sx={{ px: 1.25, pt: 1, pb: 0.25 }}>
                            <ChatMentionChip
                                mention={mentionDraftChip}
                                disabled={isComposerBusy}
                                maxLabelWidth={170}
                                variant="composer"
                                onRemove={removeMentionDraftChip}
                            />
                        </Box>
                    )}

                    <ChatMentionSuggestionsPopper
                        open={shouldShowMentionSuggestions}
                        anchorEl={textInputAnchorEl}
                        suggestions={mentionSuggestions}
                        highlightedIndex={highlightedMentionIndex}
                        onHighlight={setHighlightedMentionIndex}
                        onSelect={insertMention}
                    />

                    <ChatComposerTextInput
                        fileInputRef={fileInputRef}
                        imageUploadPending={imageUploadPending}
                        inputRef={handleTextInputRef}
                        isComposerBusy={isComposerBusy}
                        messageInput={messageInput}
                        onBlur={handleTextInputBlur}
                        onChange={handleTextInputChange}
                        onClick={syncCaretPosition}
                        onFocus={handleTextInputFocus}
                        onInsertEmoji={handleInsertEmoji}
                        onKeyDown={handleTextInputKeyDown}
                        onKeyUp={syncCaretPosition}
                        onPaste={handlePaste}
                        onSelect={syncCaretPosition}
                        onSend={onSend}
                        onSendGif={onSendGif}
                        onSendSiren={onSendSiren}
                    />
                </>
            )}
        </Stack>
    );
};

export default ChatComposer;
