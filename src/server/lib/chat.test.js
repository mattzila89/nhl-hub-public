import { describe, expect, it } from "vitest";
import { sanitizeChatMessageCursor, sanitizeChatRoomKey } from "./chat.js";

describe("server chat helpers", () => {
    it("sanitizes empty room keys to the global room", () => {
        expect(sanitizeChatRoomKey()).toBe("global");
        expect(sanitizeChatRoomKey("   ")).toBe("global");
    });

    it("trims valid room keys", () => {
        expect(sanitizeChatRoomKey("  playoffs  ")).toBe("playoffs");
    });

    it("returns null for invalid cursors", () => {
        expect(sanitizeChatMessageCursor()).toBeNull();
        expect(sanitizeChatMessageCursor("abc")).toBeNull();
        expect(sanitizeChatMessageCursor("-5")).toBeNull();
        expect(sanitizeChatMessageCursor("0")).toBeNull();
    });

    it("parses positive cursor values", () => {
        expect(sanitizeChatMessageCursor("42")).toBe(42);
        expect(sanitizeChatMessageCursor(7)).toBe(7);
    });
});
