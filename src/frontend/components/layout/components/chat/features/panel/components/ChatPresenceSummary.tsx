import { Avatar, Box, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ChatMessageUser } from "../../../../../../../../interfaces";

type ChatPresenceSummaryProps = {
    currentUserId?: number;
    onlineUsers: ChatMessageUser[];
};

const MAX_VISIBLE_USERS = 3;

const ChatPresenceSummary = ({
    currentUserId,
    onlineUsers,
}: ChatPresenceSummaryProps) => {
    const otherOnlineUsers = onlineUsers.filter((onlineUser) => {
        return onlineUser.id !== currentUserId;
    });

    if (otherOnlineUsers.length === 0) {
        return null;
    }

    const sortedUsers = [...otherOnlineUsers].sort((leftUser, rightUser) => {
        const leftName =
            typeof leftUser.name === "string" && leftUser.name.trim() !== ""
                ? leftUser.name.trim().toLowerCase()
                : `user-${leftUser.id}`;
        const rightName =
            typeof rightUser.name === "string" && rightUser.name.trim() !== ""
                ? rightUser.name.trim().toLowerCase()
                : `user-${rightUser.id}`;

        return leftName.localeCompare(rightName);
    });
    const visibleUsers = sortedUsers.slice(0, MAX_VISIBLE_USERS);

    return (
        <Box
            aria-label={`${otherOnlineUsers.length} other users online`}
            sx={{
                position: "relative",
                width: 18 + visibleUsers.length * 24,
                height: 30,
                flexShrink: 0,
            }}
        >
            {visibleUsers.map((onlineUser, index) => (
                <Tooltip
                    key={onlineUser.id}
                    title={onlineUser.name ?? `User ${onlineUser.id}`}
                    arrow
                    placement="top"
                >
                    <Avatar
                        src={onlineUser.avatar_url}
                        alt={onlineUser.name ?? `User ${onlineUser.id}`}
                        sx={{
                            position: "absolute",
                            right: index * 16,
                            top: 0,
                            width: 26,
                            height: 26,
                            border: `2px solid ${alpha("#5d7dff", 0.95)}`,
                            backgroundColor: alpha("#273043", 0.92),
                            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.28)",
                        }}
                    />
                </Tooltip>
            ))}
        </Box>
    );
};

export default ChatPresenceSummary;
