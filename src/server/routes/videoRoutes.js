import { getAuthenticatedUser } from "../services/authService.js";
import {
    ensureStreamUrlIsWorking,
    getLatestVideoByGameId,
    upsertGameStream,
} from "../services/videoService.js";

export const registerVideoRoutes = (app) => {
    app.get("/stream/:gameId", async (req, res) => {
        const gameId = Number(req.params.gameId);

        if (!Number.isInteger(gameId) || gameId <= 0) {
            return res.status(400).json({ error: "Invalid game ID" });
        }

        try {
            const video = await getLatestVideoByGameId(gameId);
            return res.json(video);
        } catch (error) {
            return res.status(error?.status ?? 500).json({
                error:
                    error instanceof Error && error.message
                        ? error.message
                        : "Failed to fetch highlight video",
            });
        }
    });

    app.put("/stream/:gameId", async (req, res) => {
        const gameId = Number(req.params.gameId);
        const videoUrl =
            typeof req.body.videoUrl === "string"
                ? req.body.videoUrl.trim()
                : "";

        if (!Number.isInteger(gameId) || gameId <= 0) {
            return res.status(400).json({ error: "Invalid game ID" });
        }

        if (!videoUrl) {
            return res.status(400).json({ error: "Video URL is required" });
        }

        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        if (authResult.user.role !== "admin") {
            return res.status(403).json({ error: "Admin access required" });
        }

        try {
            await ensureStreamUrlIsWorking(videoUrl);
            const existingVideo = await getLatestVideoByGameId(gameId);
            const { stream } = await upsertGameStream({
                gameId,
                videoUrl,
                existingVideo,
            });

            return res.json(stream);
        } catch (error) {
            return res.status(error?.status ?? 500).json({
                error:
                    error instanceof Error && error.message
                        ? error.message
                        : "Failed to save stream",
            });
        }
    });
};
