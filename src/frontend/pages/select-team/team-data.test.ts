import { describe, expect, it } from "vitest";
import { teams } from "./team-data";

describe("team-data", () => {
    it("has unique team ids and abbreviations", () => {
        expect(new Set(teams.map((team) => team.id)).size).toBe(teams.length);
        expect(new Set(teams.map((team) => team.abbrev)).size).toBe(
            teams.length,
        );
    });

    it("has display data for every selectable team", () => {
        teams.forEach((team) => {
            expect(team.name).toBeTruthy();
            expect(team.abbrev).toMatch(/^[A-Z]{3}$/);
            expect(team.logo).toMatch(/^https?:\/\//);
            expect(team.wallpaper).toMatch(/^https?:\/\//);
            expect(team.primaryColor).toMatch(/^#/);
            expect(team.secondaryColor).toBeTruthy();
            expect(team.primaryColorRgb).toMatch(/^\d{1,3}, \d{1,3}, \d{1,3}$/);
            expect(team.videoCode).toBeTruthy();
            expect(team.emojis.length).toBeGreaterThan(0);
        });
    });

    it("has goal animation codes for NHL club teams", () => {
        teams
            .filter((team) => team.id !== 0)
            .forEach((team) => {
                expect(team.goalAnimationCode).toBeTruthy();
            });
    });
});
