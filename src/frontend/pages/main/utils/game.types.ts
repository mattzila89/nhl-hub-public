export type ViewFilter = "team" | "all";

type GameStatus = "PRE" | "LIVE" | "CRIT" | "FINAL" | "OFF" | "FUT";

type PeriodType = "REG" | "OT" | "SO";

export interface Games {
    games: Game[];
}

interface GameWeek extends Games {
    date: string;
    dayAbbrev: string; // e.g. SUN, MON, etc
    numberOfGames: number;
}

export interface AllGames {
    gameWeek: GameWeek[];
}

export interface GameStream {
    id: number;
    created_at: string;
    game_id: number;
    video_url: string;
}

interface Situation {
    homeTeam: {
        abbrev: string;
        situationDescriptions?: string[]; // ["ALL", "PP", "PK", "ES"]
        strength: number;
    };
    awayTeam: {
        abbrev: string;
        situationDescriptions: string[]; // ["ALL", "PP", "PK", "ES"]
        strength: number;
    };
    timeRemaining: string;
    secondsRemaining: number;
}

interface TVBroadcasts {
    id: number;
    countryCode: string;
    network: string;
}

export interface Game {
    id: number;
    gameDate: string;
    startTimeUTC: string; // Convert this to users' current time zone.
    gameState: GameStatus;
    tvBroadcasts: TVBroadcasts[];
    homeTeam: {
        abbrev: string;
        logo: string;
        name?: { default: string };
        placeName?: { default: string };
        commonName?: { default: string };
        sog?: number;
        score?: number;
    };
    awayTeam: {
        abbrev: string;
        logo: string;
        name?: { default: string };
        placeName?: { default: string };
        commonName?: { default: string };
        sog?: number;
        score?: number;
    };
    periodDescriptor: {
        number: number;
        periodType: PeriodType;
        maxRegulationPeriods: number;
    };
    gameOutcome?: { lastPeriodType: PeriodType };
    condensedGame?: string;
    gameCenterLink?: string;
    clock?: {
        timeRemaining: string;
        secondsRemaining: number;
        running: boolean;
        inIntermission: boolean;
    };
    situation?: Situation;
    seriesStatus?: {
        round: number;
        seriesAbbrev: string; // R1
        seriesTitle: string; // 1st Round
        seriesLetter: string;
        neededToWin: number;
        topSeedTeamAbbrev: string;
        topSeedWins: number;
        bottomSeedTeamAbbrev: string;
        bottomSeedWins: number;
        gameNumberOfSeries: number;
    };
}
