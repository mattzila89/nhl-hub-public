import { describe, expect, it } from "vitest";
import type { Game } from "./game.types";
import {
    getPeriodDisplay,
    isGameLive,
    isGameOver,
    useAppropriateLogo,
} from "./utils";

const createGame = (overrides: Partial<Game> = {}): Game => ({
    id: 1,
    gameDate: "2026-05-06",
    startTimeUTC: "2026-05-06T23:00:00Z",
    gameState: "LIVE",
    tvBroadcasts: [],
    homeTeam: {
        abbrev: "TOR",
        logo: "tor-light.svg",
    },
    awayTeam: {
        abbrev: "MTL",
        logo: "mtl.svg",
    },
    periodDescriptor: {
        number: 1,
        periodType: "REG",
        maxRegulationPeriods: 3,
    },
    ...overrides,
});

describe("game utils", () => {
    it("identifies live and completed game states", () => {
        expect(isGameLive(createGame({ gameState: "LIVE" }))).toBe(true);
        expect(isGameLive(createGame({ gameState: "CRIT" }))).toBe(true);
        expect(isGameLive(createGame({ gameState: "PRE" }))).toBe(true);
        expect(isGameLive(createGame({ gameState: "FINAL" }))).toBe(false);

        expect(isGameOver(createGame({ gameState: "FINAL" }))).toBe(true);
        expect(isGameOver(createGame({ gameState: "OFF" }))).toBe(true);
        expect(isGameOver(createGame({ gameState: "LIVE" }))).toBe(false);
    });

    it("formats regulation, overtime, shootout, and intermission periods", () => {
        expect(getPeriodDisplay(createGame())).toBe("1st");
        expect(
            getPeriodDisplay(
                createGame({
                    periodDescriptor: {
                        number: 3,
                        periodType: "REG",
                        maxRegulationPeriods: 3,
                    },
                }),
            ),
        ).toBe("3rd");
        expect(
            getPeriodDisplay(
                createGame({
                    periodDescriptor: {
                        number: 4,
                        periodType: "OT",
                        maxRegulationPeriods: 3,
                    },
                }),
            ),
        ).toBe("OT");
        expect(
            getPeriodDisplay(
                createGame({
                    periodDescriptor: {
                        number: 5,
                        periodType: "SO",
                        maxRegulationPeriods: 3,
                    },
                }),
            ),
        ).toBe("SO");
        expect(
            getPeriodDisplay(
                createGame({
                    clock: {
                        inIntermission: true,
                        running: false,
                        secondsRemaining: 600,
                        timeRemaining: "10:00",
                    },
                    periodDescriptor: {
                        number: 2,
                        periodType: "REG",
                        maxRegulationPeriods: 3,
                    },
                }),
            ),
        ).toBe("2nd INT");
    });

    it("uses the dark Lightning logo variant", () => {
        expect(
            useAppropriateLogo({
                abbrev: "TBL",
                logo: "tampa-light.svg",
                name: { default: "Lightning" },
            }),
        ).toBe("tampa-dark.svg");
    });
});
