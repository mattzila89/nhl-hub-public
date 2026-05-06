import { AddRounded, Send } from "@mui/icons-material";
import {
    CircularProgress,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type * as React from "react";

import type { GiphyGif } from "../../../../../../../services/GiphyService";
import ChatEmojiPicker from "../../emoji/ChatEmojiPicker";
import ChatGifPicker from "../../gif/ChatGifPicker";
import ChatSirenButton from "./ChatSirenButton";
import useNeedsIosInputZoomWorkaround from "../../../hooks/useNeedsIosInputZoomWorkaround";

type ChatComposerTextInputProps = {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    imageUploadPending?: boolean;
    inputRef: (inputElement: HTMLInputElement | HTMLTextAreaElement | null) => void;
    isComposerBusy?: boolean;
    messageInput: string;
    onBlur: () => void;
    onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    onClick: () => void;
    onFocus: () => void;
    onInsertEmoji: (emoji: string) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    onKeyUp: () => void;
    onPaste: (event: React.ClipboardEvent<HTMLDivElement>) => void;
    onSelect: () => void;
    onSend: () => void;
    onSendGif: (gif: GiphyGif) => Promise<void>;
    onSendSiren: () => void;
};

const ChatComposerTextInput = ({
    fileInputRef,
    imageUploadPending = false,
    inputRef,
    isComposerBusy = false,
    messageInput,
    onBlur,
    onChange,
    onClick,
    onFocus,
    onInsertEmoji,
    onKeyDown,
    onKeyUp,
    onPaste,
    onSelect,
    onSend,
    onSendGif,
    onSendSiren,
}: ChatComposerTextInputProps) => {
    const needsIosInputZoomWorkaround = useNeedsIosInputZoomWorkaround();

    return (
        <TextField
            fullWidth
            inputRef={inputRef}
            multiline
            maxRows={4}
            value={messageInput}
            placeholder="Type your message..."
            onBlur={onBlur}
            onChange={onChange}
            onClick={onClick}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            onPaste={onPaste}
            onSelect={onSelect}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <Stack
                                direction="row"
                                spacing={0.4}
                                sx={{ alignItems: "center" }}
                            >
                                {messageInput.length ? (
                                    <IconButton
                                        disabled={
                                            isComposerBusy ||
                                            messageInput.trim() === ""
                                        }
                                        sx={{
                                            color: "#fff",
                                            "&:hover": {
                                                transform: "scale(1.1)",
                                            },
                                        }}
                                        onClick={onSend}
                                    >
                                        <Send fontSize="small" />
                                    </IconButton>
                                ) : (
                                    <>
                                        <IconButton
                                            aria-label="Upload image"
                                            disabled={isComposerBusy}
                                            onClick={() => {
                                                fileInputRef.current?.click();
                                            }}
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                color: "#fff",
                                                backgroundColor: alpha(
                                                    "#ffffff",
                                                    0.06,
                                                ),
                                                "&:hover": {
                                                    backgroundColor: alpha(
                                                        "#ffffff",
                                                        0.12,
                                                    ),
                                                },
                                                "&.Mui-disabled": {
                                                    color: alpha(
                                                        "#ffffff",
                                                        0.58,
                                                    ),
                                                    backgroundColor: alpha(
                                                        "#ffffff",
                                                        0.05,
                                                    ),
                                                    opacity: 1,
                                                },
                                            }}
                                        >
                                            {imageUploadPending ? (
                                                <CircularProgress
                                                    size={16}
                                                    sx={{ color: "#fff" }}
                                                />
                                            ) : (
                                                <AddRounded fontSize="small" />
                                            )}
                                        </IconButton>
                                        <ChatEmojiPicker
                                            disabled={isComposerBusy}
                                            onSelectEmoji={onInsertEmoji}
                                        />
                                        <ChatGifPicker
                                            disabled={isComposerBusy}
                                            onSendGif={onSendGif}
                                        />
                                        <ChatSirenButton
                                            disabled={isComposerBusy}
                                            onSendSiren={onSendSiren}
                                        />
                                    </>
                                )}
                            </Stack>
                        </InputAdornment>
                    ),
                },
            }}
            sx={{
                "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    p: needsIosInputZoomWorkaround
                        ? "12px 5px 12px 14px"
                        : "14px 5px 14px 16px",
                    fontFamily: "Inter",
                    fontSize: needsIosInputZoomWorkaround ? 16 : 12,
                    color: "#fff",
                    fontWeight: needsIosInputZoomWorkaround ? 500 : 600,
                    "& fieldset": {
                        border: "none",
                    },
                    "&:hover fieldset": {
                        border: "none",
                    },
                    "&.Mui-focused fieldset": {
                        border: "none",
                    },
                },
                "& .MuiInputBase-input": {
                    fontSize: needsIosInputZoomWorkaround ? 16 : 12,
                    lineHeight: needsIosInputZoomWorkaround ? 1.25 : 1.4,
                    letterSpacing: needsIosInputZoomWorkaround
                        ? "-0.01em"
                        : "normal",
                },
            }}
        />
    );
};

export default ChatComposerTextInput;
