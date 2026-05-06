import { describe, expect, it } from "vitest";
import {
    formatReactionTooltip,
    getEmojiOnlyMessageBody,
    getErrorMessage,
    getMessageBodyWithoutPreviewUrl,
    getMessagePreviewUrl,
    getVisibleGraphemes,
} from "./chatMessageFormatting";

describe("chatMessageFormatting", () => {
    it("splits visible graphemes and recognizes short emoji-only messages", () => {
        expect(getVisibleGraphemes(" 🏒🔥 ")).toEqual(["🏒", "🔥"]);
        expect(getEmojiOnlyMessageBody(" 🏒🔥 ")).toBe("🏒🔥");
        expect(getEmojiOnlyMessageBody("🏒🔥🚨💙")).toBeNull();
        expect(getEmojiOnlyMessageBody("goal 🏒")).toBeNull();
    });

    it("normalizes preview URLs and strips trailing punctuation", () => {
        expect(getMessagePreviewUrl("Watch www.nhl.com/game,")).toBe(
            "https://www.nhl.com/game",
        );
        expect(getMessagePreviewUrl("Watch https://example.com/game).")).toBe(
            "https://example.com/game",
        );
        expect(getMessagePreviewUrl("no link here")).toBeNull();
    });

    it("removes the preview URL from the visible message body", () => {
        const previewUrl = "https://example.com/game";

        expect(
            getMessageBodyWithoutPreviewUrl(
                "Watch https://example.com/game now",
                previewUrl,
            ),
        ).toBe("Watch now");
        expect(
            getMessageBodyWithoutPreviewUrl("https://example.com/game", previewUrl),
        ).toBe("");
    });

    it("formats reaction tooltips for readable lists", () => {
        expect(formatReactionTooltip([])).toBe("");
        expect(formatReactionTooltip(["Auston"])).toBe("Auston");
        expect(formatReactionTooltip(["Auston", "Mitch"])).toBe(
            "Auston and Mitch",
        );
        expect(formatReactionTooltip(["Auston", "Mitch", "William"])).toBe(
            "Auston, Mitch, and William",
        );
    });

    it("uses Error messages and falls back for unknown thrown values", () => {
        expect(getErrorMessage(new Error("Nope"), "Fallback")).toBe("Nope");
        expect(getErrorMessage("Nope", "Fallback")).toBe("Fallback");
    });
});
