import dotenv from "dotenv";

dotenv.config();

const normalizeOrigin = (value) => {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim().replace(/\/+$/, "");

    if (!trimmedValue) {
        return null;
    }

    try {
        const url = new URL(trimmedValue);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return null;
        }

        return url.origin;
    } catch {
        return null;
    }
};

export const TRUST_PROXY_HOPS = Number.parseInt(
    process.env.TRUST_PROXY_HOPS || "1",
    10,
);

const CONFIGURED_CORS_ALLOWED_ORIGINS = String(
    process.env.CORS_ALLOWED_ORIGINS || "",
)
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

const DEFAULT_CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "https://nhl-hub.vercel.app",
    "https://nhlhub.app",
    "https://www.nhlhub.app",
];

export const CORS_ALLOWED_ORIGINS =
    CONFIGURED_CORS_ALLOWED_ORIGINS.length === 0
        ? []
        : [
              ...new Set([
                  ...DEFAULT_CORS_ALLOWED_ORIGINS,
                  ...CONFIGURED_CORS_ALLOWED_ORIGINS,
              ]),
          ];

export const EASTERN_TIME_ZONE = "America/New_York";
export const OVERNIGHT_CARRYOVER_END_HOUR = 5;
export const FINAL_GAME_STATES = new Set(["FINAL", "OFF"]);

export const CHAT_MESSAGE_TYPES = new Set(["text", "gif", "image", "siren"]);
export const CHAT_REACTION_TYPES = new Set([
    "like",
    "love",
    "laugh",
    "wow",
    "sad",
]);
export const CHAT_MESSAGE_PAGE_SIZE = 40;
export const CHAT_READ_RECEIPTS_TABLE = "chat_message_reads";
export const CHAT_MEDIA_BUCKET = process.env.CHAT_MEDIA_BUCKET || "chat-media";
export const CHAT_IMAGE_MAX_BYTES = 6 * 1024 * 1024;
export const CHAT_MEDIA_SIGNED_URL_TTL_SECONDS = Number.parseInt(
    process.env.CHAT_MEDIA_SIGNED_URL_TTL_SECONDS || String(24 * 60 * 60),
    10,
);
export const CHAT_IMAGE_ALLOWED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
];
export const CHAT_IMAGE_EXTENSION_BY_MIME = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
};

export const STREAM_PROBE_TIMEOUT_MS = Math.max(
    Number.parseInt(process.env.STREAM_PROBE_TIMEOUT_MS || "8000", 10) || 0,
    1000,
);
export const STREAM_PROBE_MAX_CHARACTERS = Math.max(
    Number.parseInt(process.env.STREAM_PROBE_MAX_CHARACTERS || "25000", 10) ||
        0,
    1000,
);
export const STREAM_PROBE_SUCCESS_MARKERS = [
    "<iframe",
    "allowfullscreen",
    "jwplayer",
    "videojs",
    "clappr",
    "hls.js",
    ".m3u8",
    "<video",
    "application/vnd.apple.mpegurl",
];
export const STREAM_PROBE_FAILURE_MARKERS = [
    "404 not found",
    "video not found",
    "channel not found",
    "video unavailable",
    "video unavailable",
    "page not found",
    "file not found",
    "access denied",
    "forbidden",
    "token expired",
    "invalid token",
    "video is offline",
    "channel is offline",
    "unable to load highlight video",
    "no playable sources",
];

export const LINK_PREVIEW_TIMEOUT_MS = 4500;
export const LINK_PREVIEW_CACHE_TTL_MS = 30 * 60 * 1000;

export const GIPHY_API_BASE_URL = "https://api.giphy.com/v1/gifs";
export const DEFAULT_GIPHY_LIMIT = 20;
export const MAX_GIPHY_LIMIT = 24;
export const MAX_GIPHY_OFFSET = 4999;
export const GIPHY_CONTENT_RATING = "pg";
export const GIPHY_DEFAULT_COUNTRY_CODE = "US";
export const GIPHY_DEFAULT_LANGUAGE = "en";

export const SERVER_PORT = Number.parseInt(process.env.PORT || "3001", 10);
export const LOGIN_CODE_PATTERN = /^\d{8}$/;
export const LOGIN_MAX_FAILED_ATTEMPTS = Number.parseInt(
    process.env.LOGIN_MAX_FAILED_ATTEMPTS || "10",
    10,
);
export const LOGIN_LOCKOUT_DURATION_MS = Number.parseInt(
    process.env.LOGIN_LOCKOUT_DURATION_MS || String(15 * 60 * 1000),
    10,
);
export const LOGIN_FAILURE_RESET_MS = Number.parseInt(
    process.env.LOGIN_FAILURE_RESET_MS || String(30 * 60 * 1000),
    10,
);
export const LOGIN_ATTEMPT_RECORD_TTL_MS =
    Math.max(LOGIN_LOCKOUT_DURATION_MS, LOGIN_FAILURE_RESET_MS) * 2;
