import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApiUrl, getSocketServerUrl } from "./api";

describe("api URL helpers", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("uses the local Vite proxy when no API base URL is configured", () => {
        vi.stubEnv("VITE_API_BASE_URL", "");

        expect(buildApiUrl("/me")).toBe("/api/me");
        expect(buildApiUrl("chat/messages")).toBe("/api/chat/messages");
    });

    it("uses a configured API base URL and trims trailing slashes", () => {
        vi.stubEnv("VITE_API_BASE_URL", "https://api.nhlhub.test/");

        expect(buildApiUrl("/me")).toBe("https://api.nhlhub.test/me");
    });

    it("prefers the configured socket URL over the API URL", () => {
        vi.stubEnv("VITE_API_BASE_URL", "https://api.nhlhub.test");
        vi.stubEnv("VITE_SOCKET_URL", "https://socket.nhlhub.test/");

        expect(getSocketServerUrl()).toBe("https://socket.nhlhub.test");
    });

    it("falls back to the API URL for sockets when no socket URL is configured", () => {
        vi.stubEnv("VITE_API_BASE_URL", "https://api.nhlhub.test/");
        vi.stubEnv("VITE_SOCKET_URL", "");

        expect(getSocketServerUrl()).toBe("https://api.nhlhub.test");
    });
});
