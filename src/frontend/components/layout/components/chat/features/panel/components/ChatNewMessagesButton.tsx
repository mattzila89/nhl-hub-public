import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { alpha } from "@mui/material/styles";

type ChatNewMessagesButtonProps = {
    count: number;
    onClick: () => void;
};

const ChatNewMessagesButton = ({
    count,
    onClick,
}: ChatNewMessagesButtonProps) => {
    if (count <= 0) {
        return null;
    }

    return (
        <Box
            sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 12,
                zIndex: 5,
                display: "flex",
                justifyContent: "center",
                px: 1.5,
                pointerEvents: "none",
            }}
        >
            <Button
                size="small"
                variant="contained"
                endIcon={<KeyboardArrowDownRounded />}
                onClick={onClick}
                sx={{
                    pointerEvents: "auto",
                    minHeight: 32,
                    px: 1.5,
                    borderRadius: "999px",
                    color: "#ffffff",
                    fontFamily: "Inter",
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "none",
                    backgroundColor: alpha("#000000", 0.82),
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 14px 30px rgba(0, 0, 0, 0.34)",
                    "&:hover": {
                        backgroundColor: alpha("#000000", 0.9),
                    },
                }}
            >
                {count === 1 ? "1 new message" : `${count} new messages`}
            </Button>
        </Box>
    );
};

export default ChatNewMessagesButton;
