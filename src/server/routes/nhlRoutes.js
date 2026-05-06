import {
    fetchNhlClubScheduleNow,
    fetchNhlGameCenterLanding,
    fetchNhlPlayoffBracket,
    fetchNhlPlayoffSeriesSchedule,
    fetchNhlStandings,
    getCurrentGamesSchedule,
    getGamesForDate,
    getPlayoffSeasonId,
    getPlayoffSlateDate,
    mapPlayoffScheduleGame,
} from "../services/nhlService.js";

export const registerNhlRoutes = (app) => {
    app.get("/team-games/:team", async (req, res) => {
        const { team } = req.params;

        try {
            const data = await fetchNhlClubScheduleNow(team);

            return res.json(data);
        } catch (error) {
            if (error?.status) {
                return res.status(error.status).json({
                    error: "Failed to fetch team schedule from NHL API",
                });
            }

            return res.status(500).json({
                error: "Unexpected error while fetching team schedule",
            });
        }
    });

    app.get("/all-games/today", async (_req, res) => {
        try {
            const schedule = await getCurrentGamesSchedule();
            return res.json(schedule);
        } catch (error) {
            return res.status(500).json({
                error:
                    error?.status === 404
                        ? "No schedule found for the requested date"
                        : "Unexpected error while fetching all games schedule",
            });
        }
    });

    app.get("/standings/now", async (_req, res) => {
        try {
            const data = await fetchNhlStandings();

            return res.json(data);
        } catch (error) {
            return res.status(error?.status ?? 500).json({
                error:
                    error?.status === 404
                        ? "No standings found for the current date"
                        : "Unexpected error while fetching standings",
            });
        }
    });

    app.get("/playoffs/bracket/:year", async (req, res) => {
        const year = Number.parseInt(req.params.year, 10);

        if (!Number.isInteger(year) || year < 1917 || year > 3000) {
            return res.status(400).json({
                error: "Invalid playoff bracket year",
            });
        }

        try {
            const data = await fetchNhlPlayoffBracket(year);

            return res.json(data);
        } catch (error) {
            return res.status(error?.status ?? 500).json({
                error:
                    error?.status === 404
                        ? "No playoff bracket found for that year"
                        : "Unexpected error while fetching playoff bracket",
            });
        }
    });

    app.get("/playoffs/:year/round/:round/games", async (req, res) => {
        const year = Number.parseInt(req.params.year, 10);
        const round = Number.parseInt(req.params.round, 10);

        if (!Number.isInteger(year) || year < 1917 || year > 3000) {
            return res.status(400).json({
                error: "Invalid playoff year",
            });
        }

        if (!Number.isInteger(round) || round < 1 || round > 4) {
            return res.status(400).json({
                error: "Invalid playoff round",
            });
        }

        try {
            const bracket = await fetchNhlPlayoffBracket(year);
            const seasonId = getPlayoffSeasonId(year);
            const roundSeries = Array.isArray(bracket?.series)
                ? bracket.series.filter((series) => {
                      return (
                          typeof series?.seriesLetter === "string" &&
                          series.seriesLetter.trim() !== "" &&
                          series.topSeedTeam &&
                          series.bottomSeedTeam
                      );
                  })
                : [];

            const roundSchedules = await Promise.all(
                roundSeries.map(async (series) => {
                    try {
                        const schedule = await fetchNhlPlayoffSeriesSchedule({
                            seasonId,
                            seriesLetter: series.seriesLetter,
                        });

                        return {
                            bracketSeries: series,
                            schedule,
                        };
                    } catch (error) {
                        if (error?.status === 404) {
                            return null;
                        }

                        throw error;
                    }
                }),
            );

            const games = roundSchedules
                .filter(Boolean)
                .flatMap((seriesEntry) => {
                    const scheduleGames = Array.isArray(
                        seriesEntry.schedule?.games,
                    )
                        ? seriesEntry.schedule.games
                        : [];

                    return scheduleGames.map((game) => {
                        return mapPlayoffScheduleGame(
                            game,
                            seriesEntry.schedule,
                            seriesEntry.bracketSeries,
                        );
                    });
                })
                .sort((a, b) => {
                    return (
                        new Date(a.startTimeUTC).getTime() -
                        new Date(b.startTimeUTC).getTime()
                    );
                });
            const slateDate = getPlayoffSlateDate(games);
            const slateGames = getGamesForDate(games, slateDate);

            return res.json({
                year,
                seasonId,
                round,
                roundLabel: "Playoff Games",
                date: slateDate,
                numberOfGames: slateGames.length,
                games: slateGames,
            });
        } catch (error) {
            return res.status(error?.status ?? 500).json({
                error:
                    error?.status === 404
                        ? "No playoff games found for that round"
                        : "Unexpected error while fetching playoff games",
            });
        }
    });

    app.get("/live-game/:id", async (req, res) => {
        const { id } = req.params;

        try {
            const data = await fetchNhlGameCenterLanding(id);

            return res.json(data);
        } catch (error) {
            if (error?.status) {
                return res.status(error.status).json({
                    error: "Failed to fetch live game from NHL API",
                });
            }

            return res.status(500).json({
                error: "Unexpected error while fetching live game",
            });
        }
    });
};
