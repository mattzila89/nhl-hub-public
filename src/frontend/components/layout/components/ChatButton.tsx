import { alpha, Badge, Box, Fab, useTheme, Zoom } from "@mui/material";
import { useAuth } from "../../../../AuthProvider";

type ChatButtonProps = {
    chatOpen: boolean;
    theaterMode: boolean;
    newMessageCount?: number;
    onOpenChat: () => void;
};

const ChatButton = ({
    chatOpen,
    theaterMode,
    newMessageCount = 0,
    onOpenChat,
}: ChatButtonProps) => {
    const { user } = useAuth();
    const theme = useTheme();
    const secondaryColor = user?.selected_team?.secondaryColor || "#000";
    const textColor = theme.palette.getContrastText(secondaryColor);
    return (
        <Zoom in={!chatOpen}>
            <Badge
                color="error"
                badgeContent={newMessageCount}
                overlap="circular"
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                sx={{
                    position: "fixed",
                    zIndex: 1301,
                    right: {
                        xs: "max(12px, calc(12px + env(safe-area-inset-right)))",
                        md: 24,
                    },
                    bottom: {
                        xs: theaterMode
                            ? "calc(16px + env(safe-area-inset-bottom))"
                            : "calc(76px + env(safe-area-inset-bottom))",
                        md: 24,
                    },
                    "& .MuiBadge-badge": {
                        zIndex: 9999,
                        fontFamily: "Inter-Black",
                        background: user?.selected_team?.secondaryColor,
                        color: textColor,
                    },
                }}
            >
                <Fab
                    aria-label="Open chat window"
                    onClick={onOpenChat}
                    sx={{
                        background: user?.selected_team?.primaryColor,
                        boxShadow: "0 18px 34px rgba(0, 0, 0, 0.26)",
                        "&:hover": {
                            background: alpha(
                                user?.selected_team?.primaryColor || "#000",
                                0.8,
                            ),
                        },
                    }}
                    data-testid="chat-fab"
                >
                    <Box
                        component="img"
                        src={user?.selected_team?.logo}
                        alt={user?.selected_team?.name}
                        sx={{
                            width: 44,
                            height: 27,
                            my: "-2px",
                            display: "block",
                            objectFit: "contain",
                        }}
                    />
                </Fab>
            </Badge>
        </Zoom>
    );
};

export default ChatButton;
