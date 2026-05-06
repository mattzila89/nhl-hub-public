import { describe, expect, it } from "vitest";
import type { GiphyGif } from "../../../../../../../services/GiphyService";
import { getGifAspectRatio } from "./chatGifPickerUtils";

const createGif = (width: number, height: number): GiphyGif => ({
    id: "goal",
    title: "Goal",
    url: "https://media.example.com/goal.gif",
    previewUrl: "https://media.example.com/goal-preview.gif",
    width,
    height,
});

describe("chatGifPickerUtils", () => {
    it("returns the GIF's intrinsic aspect ratio", () => {
        expect(getGifAspectRatio(createGif(480, 270))).toBe("480 / 270");
    });

    it("falls back to a square ratio for invalid dimensions", () => {
        expect(getGifAspectRatio(createGif(0, 270))).toBe("1 / 1");
        expect(getGifAspectRatio(createGif(480, 0))).toBe("1 / 1");
    });
});
