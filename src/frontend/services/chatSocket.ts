import { io, type Socket } from "socket.io-client";
import type {
    ChatMessage,
    ChatMessageDeleteEvent,
    ChatPresenceUpdate,
    ChatReadReceiptUpdate,
    ChatReactionUpdate,
    ChatTypingEvent,
} from "../../interfaces";
import { getSocketServerUrl } from "./api";

type ServerToClientEvents = {
    "chat:message:new": (message: ChatMessage) => void;
    "chat:message:update": (message: ChatMessage) => void;
    "chat:message:delete": (event: ChatMessageDeleteEvent) => void;
    "chat:reaction:update": (event: ChatReactionUpdate) => void;
    "chat:read:update": (event: ChatReadReceiptUpdate) => void;
    "chat:presence:update": (event: ChatPresenceUpdate) => void;
    "chat:typing:update": (event: ChatTypingEvent) => void;
};

type ClientToServerEvents = {
    "chat:typing:start": (payload?: { roomKey?: string }) => void;
    "chat:typing:stop": (payload?: { roomKey?: string }) => void;
};

let chatSocket:
    | Socket<ServerToClientEvents, ClientToServerEvents>
    | null = null;
let activeSessionToken: string | null = null;

export const getChatSocket = (sessionToken: string) => {
    if (!chatSocket) {
        chatSocket = io(getSocketServerUrl(), {
            autoConnect: false,
            path: "/socket.io",
            transports: ["websocket", "polling"],
        });
    }

    chatSocket.auth = {
        token: sessionToken,
    };

    if (activeSessionToken !== sessionToken && chatSocket.connected) {
        chatSocket.disconnect();
    }

    activeSessionToken = sessionToken;

    return chatSocket;
};

export const ensureChatSocketConnected = (sessionToken: string) => {
    const socket = getChatSocket(sessionToken);

    if (!socket.connected) {
        socket.connect();
    }

    return socket;
};

export const disconnectChatSocket = () => {
    activeSessionToken = null;
    chatSocket?.disconnect();
};
