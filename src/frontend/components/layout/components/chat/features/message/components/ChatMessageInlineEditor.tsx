import { CheckRounded, CloseRounded } from "@mui/icons-material";
import { IconButton, Stack, TextField } from "@mui/material";
import { alpha } from "@mui/material/styles";

import { actionButtonSx } from "../utils/chatMessageStyles";

type ChatMessageInlineEditorProps = {
    editValue: string;
    inlineEditorFontSize: number;
    inlineEditorLineHeight: number;
    isMessageActionPending: boolean;
    needsIosInputZoomWorkaround: boolean;
    onCancel: () => void;
    onChange: (value: string) => void;
    onSave: () => void;
};

const ChatMessageInlineEditor = ({
    editValue,
    inlineEditorFontSize,
    inlineEditorLineHeight,
    isMessageActionPending,
    needsIosInputZoomWorkaround,
    onCancel,
    onChange,
    onSave,
}: ChatMessageInlineEditorProps) => {
    return (
        <Stack
            spacing={0.75}
            sx={{
                p: 1,
                borderRadius: "14px",
                backgroundColor: alpha("#111111", 0.5),
                backdropFilter: "blur(10px)",
            }}
        >
            <TextField
                autoFocus
                multiline
                maxRows={4}
                value={editValue}
                onChange={(event) => {
                    onChange(event.target.value);
                }}
                onKeyDown={(event) => {
                    if (
                        event.key === "Enter" &&
                        !event.shiftKey &&
                        !isMessageActionPending
                    ) {
                        event.preventDefault();
                        onSave();
                    }

                    if (event.key === "Escape" && !isMessageActionPending) {
                        event.preventDefault();
                        onCancel();
                    }
                }}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        p: 1,
                        borderRadius: "10px",
                        color: "#ffffff",
                        fontSize: inlineEditorFontSize,
                        fontFamily: "Inter",
                        fontWeight: needsIosInputZoomWorkaround ? 500 : 600,
                        backgroundColor: alpha("#ffffff", 0.08),
                        "& fieldset": {
                            borderColor: alpha("#ffffff", 0.14),
                        },
                        "&:hover fieldset": {
                            borderColor: alpha("#ffffff", 0.22),
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: alpha("#ffffff", 0.26),
                        },
                    },
                    "& .MuiInputBase-input": {
                        fontSize: inlineEditorFontSize,
                        lineHeight: inlineEditorLineHeight,
                        letterSpacing: needsIosInputZoomWorkaround
                            ? "-0.01em"
                            : "normal",
                    },
                }}
            />

            <Stack
                direction="row"
                spacing={0.4}
                sx={{
                    justifyContent: "flex-end",
                }}
            >
                <IconButton
                    aria-label="Cancel editing message"
                    disabled={isMessageActionPending}
                    onClick={onCancel}
                    sx={actionButtonSx}
                >
                    <CloseRounded sx={{ fontSize: 15 }} />
                </IconButton>

                <IconButton
                    aria-label="Save edited message"
                    disabled={isMessageActionPending}
                    onClick={onSave}
                    sx={actionButtonSx}
                >
                    <CheckRounded sx={{ fontSize: 15 }} />
                </IconButton>
            </Stack>
        </Stack>
    );
};

export default ChatMessageInlineEditor;
