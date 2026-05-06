import * as React from "react";
import { Alert, Box, Fade, Stack, Typography } from "@mui/material";
import PlayoffsService from "../../../../../services/PlayoffsService";
import { PLAYOFF_BRACKET_YEAR } from "../../playoffs/playoffs.constants";
import GameCard from "../GameCard";
import LiveGameCard from "../LiveGameCard";
import { isGameLive } from "../../../utils/utils";

const formatSlateDate = (date: string) => {
    const parsedDate = new Date(`${date}T12:00:00`);

    if (!Number.isFinite(parsedDate.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
    }).format(parsedDate);
};

type GamesGridProps = {
    chatOpen: boolean;
    multiViewSelection: number[];
    // minimumSelectionsRemaining: number;
    // isMultiViewSelecting: boolean;
    // canOpenMultiView: boolean;
    hasReachedSelectionLimit: boolean;
    // onOpenMultiView: () => void;
    // onCancelMultiView: () => void;
    onOpenGame: (gameId: number) => void;
    // onToggleMultiView: (gameId: number) => void;
};

const PlayoffGamesGrid = ({
    chatOpen,
    multiViewSelection,
    // minimumSelectionsRemaining,
    // isMultiViewSelecting,
    // canOpenMultiView,
    hasReachedSelectionLimit,
    // onOpenMultiView,
    // onCancelMultiView,
    onOpenGame,
    // onToggleMultiView,
}: GamesGridProps) => {
    const roundGamesQuery = PlayoffsService.useRoundGames(
        PLAYOFF_BRACKET_YEAR,
        1,
    );
    const areGamesLoading = roundGamesQuery.isPending;
    const slateDate = roundGamesQuery.data?.date;
    const games = React.useMemo(() => {
        const roundGames = roundGamesQuery.data?.games;

        if (!Array.isArray(roundGames)) {
            return undefined;
        }

        if (!slateDate) {
            return roundGames;
        }

        return roundGames.filter((game) => game.gameDate === slateDate);
    }, [roundGamesQuery.data?.games, slateDate]);
    const hasLoadedGames =
        !areGamesLoading && !roundGamesQuery.isError && Array.isArray(games);
    const slateDateLabel = slateDate ? formatSlateDate(slateDate) : null;

    return (
        <Box
            sx={{
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                pb: {
                    xs: "calc(72px + env(safe-area-inset-bottom))",
                    md: "calc(3px + env(safe-area-inset-bottom))",
                },
                scrollbarGutter: "stable",
            }}
            data-testid="games-grid"
        >
            <Stack
                spacing={1.5}
                sx={{
                    mb: 2,
                    pr: { xs: 2, md: 0 },
                    pl: { xs: 2, md: 0.75 },
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", sm: "start" },
                    direction: { xs: "column", sm: "row" },
                }}
            >
                <Stack spacing={0.25}>
                    <Typography variant="h6">
                        {roundGamesQuery.data?.roundLabel ?? "Round 1"}
                    </Typography>
                    {slateDateLabel ? (
                        <Typography
                            variant="body2"
                            sx={{ color: "rgba(255,255,255,0.68)" }}
                        >
                            {slateDateLabel}
                        </Typography>
                    ) : null}
                </Stack>
            </Stack>

            {areGamesLoading && <Alert severity="info">Loading Games...</Alert>}

            {roundGamesQuery.isError && (
                <Alert severity="error">
                    {roundGamesQuery.error instanceof Error
                        ? roundGamesQuery.error.message
                        : "Unable to load playoff games"}
                </Alert>
            )}

            {hasLoadedGames && (
                <Fade in={hasLoadedGames} timeout={320}>
                    <Box>
                        {!games.length ? (
                            <Alert severity="info">
                                No playoff games scheduled for this slate
                            </Alert>
                        ) : (
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        md: chatOpen
                                            ? "1fr"
                                            : "repeat(2, minmax(0, 1fr))",
                                        lg: chatOpen
                                            ? "repeat(2, minmax(0, 1fr))"
                                            : "repeat(3, minmax(0, 1fr))",
                                        xl: chatOpen
                                            ? "repeat(3, minmax(0, 1fr))"
                                            : "repeat(4, minmax(0, 1fr))",
                                    },
                                    gap: { xs: 1.5, md: 2 },
                                    pb: {
                                        xs: "calc(28px + env(safe-area-inset-bottom))",
                                        md: "calc(12px + env(safe-area-inset-bottom))",
                                    },
                                }}
                            >
                                {games.map((game) => {
                                    const isSelected =
                                        multiViewSelection.includes(game.id);
                                    const selectedIndex =
                                        multiViewSelection.indexOf(game.id) + 1;
                                    const isSelectionLocked =
                                        hasReachedSelectionLimit && !isSelected;
                                    const isLive = isGameLive(game);

                                    return !isLive ? (
                                        <GameCard key={game.id} game={game} />
                                    ) : (
                                        <LiveGameCard
                                            key={game.id}
                                            game={game}
                                            isSelected={isSelected}
                                            selectedIndex={selectedIndex}
                                            isSelectionLocked={
                                                isSelectionLocked
                                            }
                                            showMultiViewAction={false}
                                            onOpenGame={onOpenGame}
                                        />
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Fade>
            )}
        </Box>
    );
};

export default PlayoffGamesGrid;
