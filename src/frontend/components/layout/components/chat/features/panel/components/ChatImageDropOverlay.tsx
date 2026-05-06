import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

const ChatImageDropOverlay = () => {
    return (
        <Box
            aria-hidden="true"
            sx={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                background:
                    "radial-gradient(circle at center, rgba(176, 12, 36, 0.22) 0%, rgba(7, 10, 18, 0.88) 62%, rgba(0, 0, 0, 0.92) 100%)",
                backdropFilter: "blur(8px)",
                pointerEvents: "none",
            }}
        >
            <Stack
                spacing={1}
                sx={{
                    alignItems: "center",
                    px: 3,
                    py: 2.5,
                    borderRadius: "20px",
                    border: `1px solid ${alpha("#ffffff", 0.18)}`,
                    backgroundColor: alpha("#ffffff", 0.06),
                    boxShadow: "0 20px 46px rgba(0, 0, 0, 0.3)",
                    textAlign: "center",
                }}
            >
                <Typography
                    sx={{
                        lineHeight: 1,
                        fontSize: 20,
                        letterSpacing: "0.04em",
                    }}
                >
                    Drop Image Anywhere
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: alpha("#ffffff", 0.78),
                        fontFamily: "Inter",
                        fontSize: 12,
                    }}
                >
                    Drop image anywhere to add to chat
                </Typography>
            </Stack>
        </Box>
    );
};

export default ChatImageDropOverlay;
