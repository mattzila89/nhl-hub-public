import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";

type ChatGoalSoundButtonProps = {
    onClick: () => void;
};

const ChatGoalSoundButton = ({ onClick }: ChatGoalSoundButtonProps) => {
    return (
        <Box
            sx={{
                position: "absolute",
                bottom: {
                    xs: "calc(24px + env(safe-area-inset-bottom))",
                    md: 24,
                },
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2,
            }}
        >
            <Box
                component="button"
                type="button"
                onClick={onClick}
                sx={{
                    appearance: "none",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: "999px",
                    px: 2.25,
                    py: 1,
                    background: alpha("#04070d", 0.72),
                    color: "#ffffff",
                    font: "inherit",
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 16px 32px rgba(0, 0, 0, 0.28)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                }}
            >
                Tap For Sound
            </Box>
        </Box>
    );
};

export default ChatGoalSoundButton;
