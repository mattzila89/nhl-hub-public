import * as React from "react";
import {
    Alert,
    Box,
    Fade,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import GameCard from "./GameCard";
import MultiViewSelectionBar from "../MultiViewSelectionBar";
import { useAuth } from "../../../../../AuthProvider";
import type { Game, ViewFilter } from "../../utils/game.types";
import GameService from "../../../../services/GamesService";
import LiveGameCard from "./LiveGameCard";
import { isGameLive } from "../../utils/utils";
import { teams } from "../../../select-team/team-data";

type GamesGridProps = {
    chatOpen: boolean;
    multiViewSelection: number[];
    minimumSelectionsRemaining: number;
    isMultiViewSelecting: boolean;
    canOpenMultiView: boolean;
    hasReachedSelectionLimit: boolean;
    onOpenMultiView: () => void;
    onCancelMultiView: () => void;
    onOpenGame: (gameId: number) => void;
    onToggleMultiView: (gameId: number) => void;
};

const GamesGrid = ({
    chatOpen,
    multiViewSelection,
    minimumSelectionsRemaining,
    isMultiViewSelecting,
    canOpenMultiView,
    hasReachedSelectionLimit,
    onOpenMultiView,
    onCancelMultiView,
    onOpenGame,
    onToggleMultiView,
}: GamesGridProps) => {
    const { user } = useAuth();
    const [view, setView] = React.useState<ViewFilter>(
        user?.selected_team && user.selected_team.id !== 0 ? "team" : "all",
    );
    const teamAbbrev: string | undefined =
        user?.selected_team?.abbrev || teams[0].abbrev;
    const selectedTeamsGames = GameService.useTeamGames({
        teamAbbrev,
        enabled: view === "team",
    });
    const allGamesThatDay = GameService.useAllGames();
    const areGamesLoading: boolean =
        selectedTeamsGames.isLoading || allGamesThatDay.isLoading;
    const games: Game[] | undefined =
        view === "team"
            ? selectedTeamsGames.data?.games
            : allGamesThatDay.data?.gameWeek[0].games;
    const moreThanTwoLive = games?.filter((allGame) => isGameLive(allGame));
    const hasLoadedGames = !areGamesLoading && Array.isArray(games);

    React.useEffect(() => {
        if (!user?.selected_team) {
            return;
        }

        if (user.selected_team.id === 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset view when user has no selected team.
            setView("all");
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect -- Default back to team view when selected team changes.
        setView("team");
    }, [user?.selected_team?.id]);

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
        >
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{
                    mb: 2,
                    pl: { xs: 2, md: 0.75 },
                    pr: { xs: 2, md: 0 },
                    alignItems: { xs: "stretch", sm: "center" },
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h6">
                    Live / Upcoming Games{" "}
                    {view === "team" ? "This Week" : "Today"}
                </Typography>

                {user?.selected_team?.id !== 0 && (
                    <ToggleButtonGroup
                        value={view}
                        exclusive
                        onChange={(_, value: ViewFilter | null) => {
                            if (value) {
                                setView(value);
                            }
                        }}
                        size="small"
                        sx={{
                            ml: { sm: "auto" },
                            borderRadius: 0.25,
                            "& .MuiToggleButton-root": {
                                color: alpha("#ffffff", 0.72),
                                borderColor: alpha("#ffffff", 0.12),
                                px: 1.5,
                                width: { xs: "100%", md: "auto" },
                                "&.Mui-selected": {
                                    color: "#101010",
                                    backgroundColor: alpha("#ffffff", 0.92),
                                },
                            },
                        }}
                    >
                        <ToggleButton value="team">
                            {user?.selected_team?.abbrev ?? "Team"}
                        </ToggleButton>
                        <ToggleButton value="all">All</ToggleButton>
                    </ToggleButtonGroup>
                )}
            </Stack>

            {areGamesLoading && <Alert severity="info">Loading Games...</Alert>}

            {hasLoadedGames && (
                <Fade in={hasLoadedGames} timeout={320}>
                    <Box>
                        {isMultiViewSelecting && (
                            <MultiViewSelectionBar
                                selectionCount={multiViewSelection.length}
                                canOpenMultiView={canOpenMultiView}
                                minimumSelectionsRemaining={
                                    minimumSelectionsRemaining
                                }
                                onOpen={onOpenMultiView}
                                onCancel={onCancelMultiView}
                            />
                        )}

                        {!games.length ? (
                            <Alert severity="info">No Games Today</Alert>
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
                                            showMultiViewAction={
                                                isLive &&
                                                view === "all" &&
                                                Boolean(
                                                    moreThanTwoLive &&
                                                    moreThanTwoLive.length >= 2,
                                                )
                                            }
                                            onOpenGame={onOpenGame}
                                            onToggleMultiView={
                                                onToggleMultiView
                                            }
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

export default GamesGrid;
