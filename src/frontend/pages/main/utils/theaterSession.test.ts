import { afterEach, describe, expect, it, vi } from "vitest";
import {
    THEATER_SESSION_STORAGE_EVENT,
    THEATER_SESSION_STORAGE_KEY,
    clearTheaterSession,
    readTheaterSession,
    writeTheaterSession,
} from "./theaterSession";

const createStorage = () => {
    const values = new Map<string, string>();

    return {
        get length() {
            return values.size;
        },
        clear: vi.fn(() => {
            values.clear();
        }),
        getItem: vi.fn((key: string) => values.get(key) ?? null),
        key: vi.fn((index: number) => [...values.keys()][index] ?? null),
        removeItem: vi.fn((key: string) => {
            values.delete(key);
        }),
        setItem: vi.fn((key: string, value: string) => {
            values.set(key, value);
        }),
    } satisfies Storage;
};

const installWindowMock = () => {
    const localStorage = createStorage();
    const dispatchEvent = vi.fn();

    vi.stubGlobal("window", {
        localStorage,
        dispatchEvent,
    });

    return { dispatchEvent, localStorage };
};

describe("theaterSession", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns null when no session is stored", () => {
        installWindowMock();

        expect(readTheaterSession()).toBeNull();
    });

    it("reads a valid theater session with safe defaults", () => {
        const { localStorage } = installWindowMock();

        localStorage.setItem(
            THEATER_SESSION_STORAGE_KEY,
            JSON.stringify({
                theaterCards: [1001, 1002],
                multiViewLayout: "spotlight",
            }),
        );

        expect(readTheaterSession()).toEqual({
            theaterCards: [1001, 1002],
            multiViewLayout: "spotlight",
            chatOpen: true,
        });
    });

    it("rejects malformed sessions", () => {
        const { localStorage } = installWindowMock();

        localStorage.setItem(
            THEATER_SESSION_STORAGE_KEY,
            JSON.stringify({
                theaterCards: [],
                multiViewLayout: "spotlight",
            }),
        );

        expect(readTheaterSession()).toBeNull();
    });

    it("writes and clears the session while notifying listeners", () => {
        const { dispatchEvent, localStorage } = installWindowMock();

        writeTheaterSession({
            theaterCards: [42],
            multiViewLayout: "grid",
            chatOpen: false,
        });

        expect(JSON.parse(localStorage.getItem(THEATER_SESSION_STORAGE_KEY)!)).toEqual(
            {
                theaterCards: [42],
                multiViewLayout: "grid",
                chatOpen: false,
            },
        );
        expect(dispatchEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                type: THEATER_SESSION_STORAGE_EVENT,
            }),
        );

        clearTheaterSession();

        expect(localStorage.getItem(THEATER_SESSION_STORAGE_KEY)).toBeNull();
        expect(dispatchEvent).toHaveBeenCalledTimes(2);
    });
});
