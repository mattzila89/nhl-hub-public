import { describe, expect, it } from "vitest";
import {
    formatEasternDate,
    getEasternDateFromStartTime,
    getEasternHour,
    getPreviousEasternDate,
} from "./date.js";

describe("server date helpers", () => {
    it("formats dates in Eastern time", () => {
        expect(formatEasternDate(new Date("2026-01-01T04:30:00Z"))).toBe(
            "2025-12-31",
        );
    });

    it("returns the Eastern hour", () => {
        expect(getEasternHour(new Date("2026-05-06T15:30:00Z"))).toBe(11);
    });

    it("gets the previous Eastern date", () => {
        expect(getPreviousEasternDate(new Date("2026-05-06T16:00:00Z"))).toBe(
            "2026-05-05",
        );
    });

    it("returns an empty date for invalid start times", () => {
        expect(getEasternDateFromStartTime("not-a-date")).toBe("");
    });
});
