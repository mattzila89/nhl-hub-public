import * as React from "react";
import { IconButton, Popover } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { EmojiEmotions } from "@mui/icons-material";
import { useAuth } from "../../../../../../../AuthProvider";
import ChatEmojiPickerContent from "./components/ChatEmojiPickerContent";
import { getChatEmojiSections } from "./utils/chatEmojiSections";

type ChatEmojiPickerProps = {
    disabled?: boolean;
    onSelectEmoji: (emoji: string) => void;
};

const ChatEmojiPicker = ({
    disabled = false,
    onSelectEmoji,
}: ChatEmojiPickerProps) => {
    const { user } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const pickerOpen = Boolean(anchorEl);
    const userEmojis = getChatEmojiSections(user?.selected_team);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
        if (pickerOpen) {
            handleClose();
            return;
        }

        setAnchorEl(event.currentTarget);
    };

    const handleEmojiSelect = (emoji: string) => {
        if (disabled) {
            return;
        }

        onSelectEmoji(emoji);
        handleClose();
    };

    return (
        <>
            <IconButton
                aria-label="Open emoji picker"
                aria-expanded={pickerOpen || undefined}
                aria-haspopup="dialog"
                disabled={disabled}
                onClick={handleToggle}
                sx={{
                    width: 34,
                    height: 34,
                    color: "#fff",
                    backgroundColor: alpha("#ffffff", 0.06),
                    "&:hover": {
                        backgroundColor: alpha("#ffffff", 0.12),
                    },
                    "&.Mui-disabled": {
                        color: alpha("#ffffff", 0.58),
                        backgroundColor: alpha("#ffffff", 0.05),
                        opacity: 1,
                    },
                }}
            >
                <EmojiEmotions fontSize="small" />
            </IconButton>

            <Popover
                anchorEl={anchorEl}
                open={pickerOpen}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            width: 320,
                            maxWidth: "calc(100vw - 20px)",
                            maxHeight: 360,
                            overflow: "hidden",
                            mb: 1,
                            borderRadius: "18px",
                            border: `1px solid ${alpha("#ffffff", 0.16)}`,
                            background:
                                "linear-gradient(180deg, rgba(10, 14, 24, 0.96) 0%, rgba(6, 8, 16, 0.94) 100%)",
                            backdropFilter: "blur(16px)",
                            boxShadow:
                                "0 24px 48px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                        },
                    },
                }}
            >
                <ChatEmojiPickerContent
                    disabled={disabled}
                    sections={userEmojis}
                    onSelectEmoji={handleEmojiSelect}
                />
            </Popover>
        </>
    );
};

export default ChatEmojiPicker;
