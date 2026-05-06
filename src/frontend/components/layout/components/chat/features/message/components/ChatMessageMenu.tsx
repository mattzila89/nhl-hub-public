import { EditRounded, UndoOutlined } from "@mui/icons-material";
import { Box, Popover, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";

type ChatMessageMenuProps = {
    anchorEl: HTMLElement | null;
    canEditMessage: boolean;
    isMessageActionPending: boolean;
    isOwnMessage: boolean;
    open: boolean;
    onClose: () => void;
    onDeleteMessage: () => void;
    onStartEditing: () => void;
};

const ChatMessageMenu = ({
    anchorEl,
    canEditMessage,
    isMessageActionPending,
    isOwnMessage,
    open,
    onClose,
    onDeleteMessage,
    onStartEditing,
}: ChatMessageMenuProps) => {
    return (
        <Popover
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{
                vertical: "top",
                horizontal: isOwnMessage ? "left" : "right",
            }}
            transformOrigin={{
                vertical: "bottom",
                horizontal: isOwnMessage ? "right" : "left",
            }}
            slotProps={{
                paper: {
                    elevation: 0,
                    sx: {
                        width: 138,
                        overflow: "hidden",
                        mb: 1,
                        borderRadius: "14px",
                        border: `1px solid ${alpha("#ffffff", 0.16)}`,
                        background:
                            "linear-gradient(180deg, rgba(10, 14, 24, 0.96) 0%, rgba(6, 8, 16, 0.94) 100%)",
                        backdropFilter: "blur(16px)",
                        boxShadow: "0 18px 36px rgba(0, 0, 0, 0.32)",
                    },
                },
            }}
        >
            <Stack spacing={0.25} sx={{ p: 0.5 }}>
                <Box
                    component="button"
                    type="button"
                    disabled={!canEditMessage || isMessageActionPending}
                    onClick={onStartEditing}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        width: "100%",
                        px: 1,
                        py: 0.85,
                        border: 0,
                        borderRadius: "10px",
                        background: "transparent",
                        color: "#ffffff",
                        fontSize: 12,
                        fontFamily: "Inter",
                        textAlign: "left",
                        cursor:
                            !canEditMessage || isMessageActionPending
                                ? "default"
                                : "pointer",
                        opacity: canEditMessage ? 1 : 0.48,
                        "&:hover": {
                            backgroundColor: alpha("#ffffff", 0.08),
                        },
                    }}
                >
                    <EditRounded sx={{ fontSize: 16 }} />
                    Edit
                </Box>

                <Box
                    component="button"
                    type="button"
                    disabled={isMessageActionPending}
                    onClick={onDeleteMessage}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        width: "100%",
                        px: 1,
                        py: 0.85,
                        border: 0,
                        borderRadius: "10px",
                        background: "transparent",
                        color: "#ffffff",
                        fontSize: 12,
                        fontFamily: "Inter",
                        textAlign: "left",
                        cursor: isMessageActionPending ? "default" : "pointer",
                        "&:hover": {
                            backgroundColor: alpha("#ffffff", 0.08),
                        },
                    }}
                >
                    <UndoOutlined sx={{ fontSize: 16 }} />
                    Unsend
                </Box>
            </Stack>
        </Popover>
    );
};

export default ChatMessageMenu;
