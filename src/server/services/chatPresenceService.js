import { sanitizeChatRoomKey } from "../lib/chat.js";
import { getChatUserPreview } from "./chatService.js";

const activeChatUsers = new Map();

export const getOnlineChatUsers = () => {
    return [...activeChatUsers.values()]
        .map((entry) => entry.user)
        .sort((leftUser, rightUser) => {
            const leftName =
                typeof leftUser.name === "string" && leftUser.name.trim() !== ""
                    ? leftUser.name.trim().toLowerCase()
                    : `user-${leftUser.id}`;
            const rightName =
                typeof rightUser.name === "string" &&
                rightUser.name.trim() !== ""
                    ? rightUser.name.trim().toLowerCase()
                    : `user-${rightUser.id}`;

            return leftName.localeCompare(rightName);
        });
};

export const addChatConnection = (user) => {
    const existingPresence = activeChatUsers.get(user.id);

    activeChatUsers.set(user.id, {
        user: getChatUserPreview(user),
        connections: (existingPresence?.connections ?? 0) + 1,
    });
};

export const removeChatConnection = (user) => {
    const currentPresence = activeChatUsers.get(user.id);

    if (!currentPresence) {
        return;
    }

    if (currentPresence.connections <= 1) {
        activeChatUsers.delete(user.id);
        return;
    }

    activeChatUsers.set(user.id, {
        ...currentPresence,
        connections: currentPresence.connections - 1,
    });
};

export const createChatPresencePayload = (roomKey = "global") => {
    return {
        roomKey: sanitizeChatRoomKey(roomKey),
        users: getOnlineChatUsers(),
    };
};
