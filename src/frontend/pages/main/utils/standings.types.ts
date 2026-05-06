type LocalizedString = {
    default: string;
    fr?: string;
};

type StandingClinchIndicator = "" | "e" | "p" | "x" | "y" | "z";

export interface StandingEntry {
    clinchIndicator?: StandingClinchIndicator;
    conferenceAbbrev: "E" | "W";
    conferenceName: string;
    conferenceSequence: number;
    date: string;
    divisionAbbrev: "A" | "M" | "C" | "P";
    divisionName: string;
    divisionSequence: number;
    gamesPlayed: number;
    losses: number;
    otLosses: number;
    placeName: LocalizedString;
    points: number;
    seasonId: number;
    streakCode: string;
    streakCount: number;
    teamAbbrev: LocalizedString;
    teamCommonName?: LocalizedString;
    teamLogo: string;
    teamName: LocalizedString;
    wildcardSequence: number;
    wins: number;
}

export interface StandingsResponse {
    standingsDateTimeUtc: string;
    standings: StandingEntry[];
    wildCardIndicator: boolean;
}
