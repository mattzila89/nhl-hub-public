import { Avatar, Box, Fade, Stack } from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";
import type { ChatMessageUser } from "../../../../../../../../interfaces";

type ChatTypingIndicatorProps = {
    typingUsers: ChatMessageUser[];
};

const dotPulse = keyframes`
    0%, 80%, 100% {
        opacity: 0.35;
        transform: translateY(0) scale(0.8);
    }

    40% {
        opacity: 1;
        transform: translateY(-2px) scale(1);
    }
`;

const ChatTypingIndicator = ({ typingUsers }: ChatTypingIndicatorProps) => {
    if (typingUsers.length === 0) {
        return null;
    }

    const visibleTypingUsers = typingUsers.slice(0, 2);

    return (
        <Fade in={visibleTypingUsers.length > 0}>
            <Stack
                direction="row"
                spacing={visibleTypingUsers.length > 1 ? 1 : 0}
                sx={{ alignItems: "flex-end", px: 2, pb: 1.25 }}
            >
                <Box
                    sx={{
                        position: "relative",
                        width: visibleTypingUsers.length > 1 ? 40 : 30,
                        height: 38,
                        flexShrink: 0,
                    }}
                >
                    {visibleTypingUsers.map((typingUser, index) => (
                        <Avatar
                            key={typingUser.id}
                            src={typingUser.avatar_url}
                            alt={typingUser.name ?? `User ${typingUser.id}`}
                            sx={{
                                position: "absolute",
                                left: index * 20,
                                bottom: 0,
                                width: 33,
                                height: 33,
                                boxShadow: "0 12px 22px rgba(0, 0, 0, 0.28)",
                                backgroundColor: alpha("#333333", 0.94),
                            }}
                        />
                    ))}
                </Box>

                <Box
                    sx={{
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        mb: "-3px !important",
                        p: "15px 12px",
                        borderRadius: "21px",
                        transform: "scale(0.65)",
                        backgroundColor: alpha("#171717", 0.88),
                        backdropFilter: "blur(6px)",
                        boxShadow: "0 18px 34px rgba(0, 0, 0, 0.24)",
                    }}
                >
                    {[0, 1, 2].map((index) => (
                        <Box
                            key={index}
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "999px",
                                backgroundColor: alpha("#f6f6f6", 0.92),
                                animation: `${dotPulse} 1.15s ease-in-out infinite`,
                                animationDelay: `${index * 0.18}s`,
                            }}
                        />
                    ))}
                </Box>
            </Stack>
        </Fade>
    );
};

export default ChatTypingIndicator;
