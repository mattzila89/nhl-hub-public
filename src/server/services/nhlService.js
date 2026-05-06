import { FINAL_GAME_STATES } from "../config.js";
import {
    formatEasternDate,
    getEasternDateFromStartTime,
    getEasternHour,
    getPreviousEasternDate,
    OVERNIGHT_CARRYOVER_END_HOUR,
} from "../lib/date.js";

export const fetchNhlSchedule = async (date) => {
    const response = await fetch(
        `https://api-web.nhle.com/v1/schedule/${date}`,
    );

    if (!response.ok) {
        const error = new Error("Failed to fetch NHL schedule");
        error.status = response.status;
        throw error;
    }

    return response.json();
};

export const fetchNhlStandings = async () => {
    const response = await fetch("https://api-web.nhle.com/v1/standings/now", {
        headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 NHLHub/1.0",
        },
    });

    if (!response.ok) {
        const error = new Error("Failed to fetch NHL standings");
        error.status = response.status;
        throw error;
    }

    return response.json();
};

export const fetchNhlPlayoffBracket = async (year) => {
    const response = await fetch(
        `https://api-web.nhle.com/v1/playoff-bracket/${year}`,
        {
            headers: {
                Accept: "application/json",
                "User-Agent": "Mozilla/5.0 NHLHub/1.0",
            },
        },
    );

    if (!response.ok) {
        const error = new Error("Failed to fetch NHL playoff bracket");
        error.status = response.status;
        throw error;
    }

    return response.json();
};

export const getPlayoffSeasonId = (year) => {
    return `${year - 1}${year}`;
};

export const fetchNhlPlayoffSeriesSchedule = async ({
    seasonId,
    seriesLetter,
}) => {
    const response = await fetch(
        `https://api-web.nhle.com/v1/schedule/playoff-series/${seasonId}/${String(
            seriesLetter,
        ).toLowerCase()}`,
        {
            headers: {
                Accept: "application/json",
                "User-Agent": "Mozilla/5.0 NHLHub/1.0",
            },
        },
    );

    if (!response.ok) {
        const error = new Error("Failed to fetch NHL playoff series schedule");
        error.status = response.status;
        throw error;
    }

    return response.json();
};

const getSeriesTeamByAbbrev = (seriesSchedule, teamAbbrev) => {
    if (seriesSchedule?.topSeedTeam?.abbrev === teamAbbrev) {
        return seriesSchedule.topSeedTeam;
    }

    if (seriesSchedule?.bottomSeedTeam?.abbrev === teamAbbrev) {
        return seriesSchedule.bottomSeedTeam;
    }

    return null;
};

export const mapPlayoffScheduleGame = (
    game,
    seriesSchedule,
    bracketSeries,
) => {
    const awaySeriesTeam = getSeriesTeamByAbbrev(
        seriesSchedule,
        game?.awayTeam?.abbrev,
    );
    const homeSeriesTeam = getSeriesTeamByAbbrev(
        seriesSchedule,
        game?.homeTeam?.abbrev,
    );
    const defaultPeriodDescriptor = {
        number: 0,
        periodType: "REG",
        maxRegulationPeriods: 3,
    };

    return {
        id: game.id,
        gameDate:
            typeof game.gameDate === "string" && game.gameDate.trim() !== ""
                ? game.gameDate
                : getEasternDateFromStartTime(game.startTimeUTC),
        startTimeUTC: game.startTimeUTC,
        gameState: game.gameState,
        tvBroadcasts: Array.isArray(game.tvBroadcasts) ? game.tvBroadcasts : [],
        awayTeam: {
            ...game.awayTeam,
            logo: awaySeriesTeam?.logo ?? "",
            name: awaySeriesTeam?.name,
            commonName: game.awayTeam?.commonName,
            placeName: game.awayTeam?.placeName,
        },
        homeTeam: {
            ...game.homeTeam,
            logo: homeSeriesTeam?.logo ?? "",
            name: homeSeriesTeam?.name,
            commonName: game.homeTeam?.commonName,
            placeName: game.homeTeam?.placeName,
        },
        periodDescriptor: defaultPeriodDescriptor,
        gameCenterLink: game.gameCenterLink,
        seriesStatus: {
            round: seriesSchedule.round,
            seriesAbbrev:
                bracketSeries?.seriesAbbrev ?? seriesSchedule.roundAbbrev,
            seriesTitle:
                bracketSeries?.seriesTitle ?? seriesSchedule.roundLabel,
            seriesLetter:
                bracketSeries?.seriesLetter ?? seriesSchedule.seriesLetter,
            neededToWin: seriesSchedule.neededToWin,
            topSeedTeamAbbrev: seriesSchedule.topSeedTeam?.abbrev ?? "",
            topSeedWins: seriesSchedule.topSeedTeam?.seriesWins ?? 0,
            bottomSeedTeamAbbrev: seriesSchedule.bottomSeedTeam?.abbrev ?? "",
            bottomSeedWins: seriesSchedule.bottomSeedTeam?.seriesWins ?? 0,
            gameNumberOfSeries: game.gameNumber,
        },
    };
};

export const getGamesForDate = (games, targetDate) => {
    return games.filter((game) => game.gameDate === targetDate);
};

const getNextScheduledGameDate = (games, targetDate) => {
    return (
        games.find((game) => {
            return game.gameDate > targetDate;
        })?.gameDate ?? null
    );
};

export const getPlayoffSlateDate = (games, now = new Date()) => {
    const todayEastern = formatEasternDate(now);
    const easternHour = getEasternHour(now);
    const shouldCheckYesterday = easternHour < OVERNIGHT_CARRYOVER_END_HOUR;

    if (shouldCheckYesterday) {
        const yesterdayEastern = getPreviousEasternDate(now);
        const yesterdayGames = getGamesForDate(games, yesterdayEastern);

        if (yesterdayGames.length > 0) {
            return yesterdayEastern;
        }
    }

    const todayGames = getGamesForDate(games, todayEastern);

    if (todayGames.length > 0) {
        return todayEastern;
    }

    return (
        getNextScheduledGameDate(games, todayEastern) ??
        games.at(-1)?.gameDate ??
        todayEastern
    );
};

const prioritizeGameWeekDate = (schedule, targetDate) => {
    if (!Array.isArray(schedule?.gameWeek)) {
        return schedule;
    }

    return {
        ...schedule,
        gameWeek: [...schedule.gameWeek].sort((a, b) => {
            if (a.date === targetDate) {
                return -1;
            }

            if (b.date === targetDate) {
                return 1;
            }

            return 0;
        }),
    };
};

const hasUnfinishedGamesForDate = (schedule, targetDate) => {
    const daySchedule = schedule?.gameWeek?.find((gameDay) => {
        return gameDay.date === targetDate;
    });

    if (!daySchedule) {
        return false;
    }

    return daySchedule.games.some((game) => {
        return !FINAL_GAME_STATES.has(game.gameState);
    });
};

export const getCurrentGamesSchedule = async () => {
    const now = new Date();
    const todayEastern = formatEasternDate(now);
    const easternHour = getEasternHour(now);
    const shouldCheckYesterday = easternHour < OVERNIGHT_CARRYOVER_END_HOUR;
    const todaySchedule = await fetchNhlSchedule(todayEastern);

    if (!shouldCheckYesterday) {
        return prioritizeGameWeekDate(todaySchedule, todayEastern);
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEastern = formatEasternDate(yesterday);
    const yesterdaySchedule = await fetchNhlSchedule(yesterdayEastern);
    const shouldUseYesterday = hasUnfinishedGamesForDate(
        yesterdaySchedule,
        yesterdayEastern,
    );

    return prioritizeGameWeekDate(
        shouldUseYesterday ? yesterdaySchedule : todaySchedule,
        shouldUseYesterday ? yesterdayEastern : todayEastern,
    );
};

export const getScheduleGames = (schedule) => {
    if (!Array.isArray(schedule?.gameWeek)) {
        return [];
    }

    return schedule.gameWeek.flatMap((gameDay) => {
        return Array.isArray(gameDay?.games) ? gameDay.games : [];
    });
};

export const fetchNhlClubScheduleNow = async (team) => {
    const response = await fetch(
        `https://api-web.nhle.com/v1/club-schedule/${team.toUpperCase()}/week/now`,
    );

    if (!response.ok) {
        const error = new Error("Failed to fetch team schedule from NHL API");
        error.status = response.status;
        throw error;
    }

    return response.json();
};

export const fetchNhlGameCenterLanding = async (id) => {
    const response = await fetch(
        `https://api-web.nhle.com/v1/gamecenter/${id}/landing`,
    );

    if (!response.ok) {
        const error = new Error("Failed to fetch live game from NHL API");
        error.status = response.status;
        throw error;
    }

    return response.json();
};
