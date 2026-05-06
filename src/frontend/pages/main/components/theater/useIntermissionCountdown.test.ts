import { describe, expect, it } from "vitest";
import type { Game } from "../../utils/game.types";
import { formatCountdown, getIntermissionSeed } from "./useIntermissionCountdown";

const createGame = (clock: Game["clock"]): Game => ({
    id: 1,
    gameDate: "2026-05-06",
    startTimeUTC: "2026-05-06T23:00:00Z",
    gameState: "LIVE",
    tvBroadcasts: [],
    homeTeam: {
        abbrev: "TOR",
        logo: "tor.svg",
    },
    awayTeam: {
        abbrev: "MTL",
        logo: "mtl.svg",
    },
    periodDescriptor: {
        number: 2,
        periodType: "REG",
        maxRegulationPeriods: 3,
    },
    clock,
});

describe("useIntermissionCountdown helpers", () => {
    it("formats seconds as a clock countdown", () => {
        expect(formatCountdown(0)).toBe("0:00");
        expect(formatCountdown(65)).toBe("1:05");
        expect(formatCountdown(-10)).toBe("0:00");
    });

    it("returns null when the game is not in intermission", () => {
        expect(
            getIntermissionSeed(
                createGame({
                    inIntermission: false,
                    running: true,
                    secondsRemaining: 0,
                    timeRemaining: "00:00",
                }),
            ),
        ).toBeNull();
    });

    it("prefers the API seconds remaining during intermission", () => {
        expect(
            getIntermissionSeed(
                createGame({
                    inIntermission: true,
                    running: false,
                    secondsRemaining: 512,
                    timeRemaining: "08:30",
                }),
            ),
        ).toBe(512);
    });

    it("parses clock text when seconds remaining is unavailable", () => {
        expect(
            getIntermissionSeed(
                createGame({
                    inIntermission: true,
                    running: false,
                    secondsRemaining: 0,
                    timeRemaining: "07:15",
                }),
            ),
        ).toBe(435);
    });

    it("falls back to a full intermission when no clock can be parsed", () => {
        expect(
            getIntermissionSeed(
                createGame({
                    inIntermission: true,
                    running: false,
                    secondsRemaining: 0,
                    timeRemaining: "intermission",
                }),
            ),
        ).toBe(18 * 60);
    });
});
