import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";

import {
    CORS_ALLOWED_ORIGINS,
    SERVER_PORT,
    TRUST_PROXY_HOPS,
} from "./config.js";
import { registerChatSocket } from "./realtime/chatSocket.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
import { registerChatRoutes } from "./routes/chatRoutes.js";
import { registerHealthRoutes } from "./routes/healthRoutes.js";
import { registerNhlRoutes } from "./routes/nhlRoutes.js";
import { registerVideoRoutes } from "./routes/videoRoutes.js";
import { ensureChatMediaBucket } from "./services/chatMediaService.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CORS_ALLOWED_ORIGINS.length === 0 ? true : CORS_ALLOWED_ORIGINS,
        credentials: true,
    },
});

const port = Number.isInteger(SERVER_PORT) ? SERVER_PORT : 3001;

app.disable("x-powered-by");
app.set(
    "trust proxy",
    Number.isInteger(TRUST_PROXY_HOPS) ? TRUST_PROXY_HOPS : 1,
);
app.use(
    cors({
        origin(origin, callback) {
            if (!origin || CORS_ALLOWED_ORIGINS.length === 0) {
                callback(null, true);
                return;
            }

            if (CORS_ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("Not allowed by CORS"));
        },
    }),
);
app.use(express.json({ limit: "50mb" }));

registerChatSocket(io);
registerHealthRoutes(app);
registerAuthRoutes(app);
registerChatRoutes(app, io);
registerNhlRoutes(app);
registerVideoRoutes(app);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);

    void ensureChatMediaBucket().catch((error) => {
        console.error("Failed to ensure chat media bucket privacy", error);
    });
});
