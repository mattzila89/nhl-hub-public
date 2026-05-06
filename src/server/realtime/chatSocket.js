import { sanitizeChatRoomKey } from "../lib/chat.js";
import { getAuthenticatedUserByToken } from "../services/authService.js";
import { getChatUserPreview } from "../services/chatService.js";
import {
    addChatConnection,
    createChatPresencePayload,
    removeChatConnection,
} from "../services/chatPresenceService.js";

export const registerChatSocket = (io) => {
    const broadcastChatPresence = (roomKey = "global") => {
        io.emit("chat:presence:update", createChatPresencePayload(roomKey));
    };

    io.use(async (socket, next) => {
        const token =
            typeof socket.handshake.auth?.token === "string"
                ? socket.handshake.auth.token
                : null;
        const authResult = await getAuthenticatedUserByToken(token);

        if ("error" in authResult) {
            return next(new Error(authResult.error));
        }

        socket.data.user = authResult.user;
        socket.data.isTyping = false;

        return next();
    });

    io.on("connection", (socket) => {
        const user = socket.data.user;

        addChatConnection(user);
        broadcastChatPresence();

        socket.on("chat:typing:start", ({ roomKey } = {}) => {
            if (socket.data.isTyping) {
                return;
            }

            socket.data.isTyping = true;
            socket.broadcast.emit("chat:typing:update", {
                roomKey: sanitizeChatRoomKey(roomKey),
                user: getChatUserPreview(socket.data.user),
                isTyping: true,
            });
        });

        socket.on("chat:typing:stop", ({ roomKey } = {}) => {
            if (!socket.data.isTyping) {
                return;
            }

            socket.data.isTyping = false;
            socket.broadcast.emit("chat:typing:update", {
                roomKey: sanitizeChatRoomKey(roomKey),
                user: getChatUserPreview(socket.data.user),
                isTyping: false,
            });
        });

        socket.on("disconnecting", () => {
            if (!socket.data.isTyping) {
                return;
            }

            socket.broadcast.emit("chat:typing:update", {
                roomKey: "global",
                user: getChatUserPreview(socket.data.user),
                isTyping: false,
            });
        });

        socket.on("disconnect", () => {
            removeChatConnection(user);
            broadcastChatPresence();
        });
    });
};
