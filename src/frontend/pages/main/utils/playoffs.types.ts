import type { Game } from "./game.types";

type LocalizedString = {
    default: string;
    fr?: string;
    cs?: string;
    de?: string;
    es?: string;
    fi?: string;
    sk?: string;
    sv?: string;
};

interface PlayoffBracketTeam {
    id: number;
    abbrev: string;
    name: LocalizedString;
    commonName: LocalizedString;
    placeNameWithPreposition: LocalizedString;
    logo: string;
    darkLogo: string;
}

export interface PlayoffSeries {
    seriesUrl?: string;
    seriesLogo?: string;
    seriesLogoFr?: string;
    seriesTitle: string;
    seriesAbbrev: string;
    seriesLetter: string;
    playoffRound: number;
    topSeedRank: number;
    topSeedRankAbbrev: string;
    topSeedWins: number;
    bottomSeedRank: number;
    bottomSeedRankAbbrev: string;
    bottomSeedWins: number;
    topSeedTeam?: PlayoffBracketTeam;
    bottomSeedTeam?: PlayoffBracketTeam;
}

export interface PlayoffBracketResponse {
    bracketLogo: string;
    bracketLogoFr?: string;
    bracketTitle: LocalizedString;
    bracketSubTitle: LocalizedString;
    series: PlayoffSeries[];
}

export interface PlayoffRoundGamesResponse {
    year: number;
    seasonId: string;
    round: number;
    roundLabel: string;
    date: string;
    numberOfGames: number;
    games: Game[];
}
