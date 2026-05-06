import { CloseRounded } from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ChatMessageUser } from "../../../../../../../../interfaces";

import ChatPresenceSummary from "./ChatPresenceSummary";

type ChatPanelHeaderProps = {
    currentUserId?: number;
    onlineUsers: ChatMessageUser[];
    onClose: () => void;
};

const ChatPanelHeader = ({
    currentUserId,
    onlineUsers,
    onClose,
}: ChatPanelHeaderProps) => {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                pl: 2.5,
                pr: 2,
                py: 1.5,
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: `1px solid ${alpha("#ffffff", 0.14)}`,
                backgroundColor: alpha("#000", 0.1),
                backdropFilter: "blur(3px)",
            }}
        >
            <Typography variant="h5" sx={{ fontSize: 18 }}>
                Locker Room
            </Typography>

            <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.25}>
                <ChatPresenceSummary
                    currentUserId={currentUserId}
                    onlineUsers={onlineUsers}
                />

                <IconButton
                    aria-label="Minimize chat"
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: "#ffffff",
                        backgroundColor: alpha("#fff", 0.08),
                        "&:hover": {
                            backgroundColor: alpha("#fff", 0.02),
                        },
                    }}
                >
                    <CloseRounded fontSize="small" />
                </IconButton>
            </Stack>
        </Stack>
    );
};

export default ChatPanelHeader;
