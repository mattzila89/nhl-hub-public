import * as React from "react";
import {
    Box,
    CircularProgress,
    Paper,
    Stack,
    Typography,
    keyframes,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import GameService from "../../../../services/GamesService";
import type { Game } from "../../utils/game.types";
import { getPeriodDisplay, isGameLive } from "../../utils/utils";
import TheaterBottomBarItem from "./TheaterBottomBarItem";
import useIntermissionCountdown, {
    formatCountdown,
} from "./useIntermissionCountdown";

type TheaterBottomBarProps = {
    primaryGameId: number;
};

const marqueeScroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const getIntermissionLabel = (game: Game) => {
    const periodLabel = getPeriodDisplay(game);

    if (periodLabel.endsWith("INT")) {
        return periodLabel.replace("INT", "Intermission");
    }

    return "Intermission";
};

const TheaterBottomBar = ({ primaryGameId }: TheaterBottomBarProps) => {
    const allGamesQuery = GameService.useAllGames();
    const primaryLiveGameQuery = GameService.useLiveGame(primaryGameId);
    const scheduleGames = allGamesQuery.data?.gameWeek?.[0]?.games ?? [];
    const liveGameIds = React.useMemo(() => {
        return scheduleGames
            .filter((game) => isGameLive(game))
            .map((game) => game.id);
    }, [scheduleGames]);
    const liveGameQueries = GameService.useLiveGames(liveGameIds);

    const liveGamesById = React.useMemo(() => {
        return new Map<number, Game>(
            liveGameIds.flatMap((id, index) => {
                const liveGame = liveGameQueries[index]?.data;

                return liveGame ? [[id, liveGame] as const] : [];
            }),
        );
    }, [liveGameIds, liveGameQueries]);

    const carouselGames = React.useMemo(() => {
        return scheduleGames.map((game) => liveGamesById.get(game.id) ?? game);
    }, [liveGamesById, scheduleGames]);

    const primaryGame =
        primaryLiveGameQuery.data ??
        carouselGames.find((game) => game.id === primaryGameId);
    const intermissionSeconds = useIntermissionCountdown(primaryGame);
    const isCurrentGameInIntermission = Boolean(
        primaryGame?.clock?.inIntermission && intermissionSeconds !== null,
    );
    const marqueeGames =
        carouselGames.length > 1
            ? [...carouselGames, ...carouselGames]
            : carouselGames;
    const animationDuration = `${Math.max(carouselGames.length * 10, 45)}s`;

    return (
        <Paper
            elevation={0}
            sx={{
                minHeight: { xs: 88, md: 108 },
                p: 0,
                borderRadius: { xs: 0, md: 1 },
                display: { xs: "none", md: "flex" },
                alignItems: "stretch",
                gap: 1.5,
                background: `linear-gradient(180deg, ${alpha("#0b0b0b", 0.95)} 0%, ${alpha("#030303", 0.98)} 100%)`,
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    position: "relative",
                    overflow: "hidden",
                    maskImage:
                        "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
                }}
            >
                {allGamesQuery.isLoading && carouselGames.length === 0 ? (
                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{
                            height: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <CircularProgress size={22} sx={{ color: "#ffffff" }} />
                        <Typography
                            variant="body2"
                            sx={{ color: alpha("#ffffff", 0.82) }}
                        >
                            Loading scoreboard...
                        </Typography>
                    </Stack>
                ) : carouselGames.length > 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            width: "max-content",
                            gap: 0,
                            height: "stretch",
                            alignItems: "stretch",
                            animation:
                                carouselGames.length > 1
                                    ? `${marqueeScroll} ${animationDuration} linear infinite`
                                    : "none",
                            "&:hover": {
                                animationPlayState: "paused",
                            },
                        }}
                    >
                        {marqueeGames.map((game, index) => (
                            <TheaterBottomBarItem
                                key={`${game.id}-${index}`}
                                game={game}
                            />
                        ))}
                    </Box>
                ) : (
                    <Stack
                        sx={{
                            height: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{ color: alpha("#ffffff", 0.82) }}
                        >
                            No games available for the current slate.
                        </Typography>
                    </Stack>
                )}
            </Box>

            {isCurrentGameInIntermission && primaryGame ? (
                <Stack
                    spacing={0.35}
                    sx={{
                        flex: "0 0 230px",
                        borderRadius: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(240,240,240,0.92) 100%)",
                        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.18)",
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: 16,
                            letterSpacing: "0.06em",
                            color: "#121212",
                            textTransform: "uppercase",
                        }}
                    >
                        {getIntermissionLabel(primaryGame)}
                    </Typography>

                    <Typography
                        variant="h3"
                        sx={{
                            fontSize: { md: 42, lg: 48 },
                            lineHeight: 1,
                            color: "#050505",
                        }}
                    >
                        {formatCountdown(intermissionSeconds ?? 0)}
                    </Typography>
                </Stack>
            ) : null}
        </Paper>
    );
};

export default TheaterBottomBar;
