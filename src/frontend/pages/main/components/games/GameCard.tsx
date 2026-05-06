import { Box, Button, Card, Stack } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { useAuth } from "../../../../../AuthProvider";
import type { Game } from "../../utils/game.types";
import GameStatus from "./GameStatus/GameStatus";
import Matchup from "./Matchup/Matchup";
import HighlighVideoUrlEditor from "./HighlighVideoUrlEditor";
import useVideoEditor from "./useVideoEditor";
import {
    getGameCardLinkButtonStyles,
    getStandardGameCardStyles,
} from "./gameCardStyles";

type GameCardProps = {
    game: Game;
};

// Shown for COMPLETED and UPCOMING games
const GameCard = ({ game }: GameCardProps) => {
    const { isAdmin, user } = useAuth();
    const {
        editing,
        isSaving,
        save,
        setStreamUrl,
        startEditing,
        streamSaveError,
        streamUrl,
    } = useVideoEditor(game.id);
    const actionButtonStyles = getGameCardLinkButtonStyles(
        // alpha(user?.selected_team?.primaryColor || "#000", 0.1),
        alpha("#000", 0.1),
    );
    const isCompletedGame =
        game.gameState === "FINAL" || game.gameState === "OFF";

    return (
        <Card
            elevation={0}
            sx={(theme: Theme) =>
                getStandardGameCardStyles({
                    theme,
                    primaryColor: user?.selected_team?.primaryColor,
                    secondaryColor: user?.selected_team?.secondaryColor,
                })
            }
            data-testid="game-card"
        >
            {editing ? (
                <HighlighVideoUrlEditor
                    streamUrl={streamUrl}
                    onStreamUrlChange={setStreamUrl}
                    streamSaveError={streamSaveError}
                />
            ) : (
                <Box>
                    <GameStatus game={game} streamUrl={streamUrl} />
                    <Matchup game={game} />
                </Box>
            )}
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    mt: editing ? 1 : 2,

                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {editing ? (
                    <Button
                        fullWidth
                        size="small"
                        disabled={isSaving}
                        sx={actionButtonStyles}
                        onClick={save}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                ) : (
                    <>
                        {isAdmin && !isCompletedGame && (
                            <Button
                                fullWidth
                                size="small"
                                sx={actionButtonStyles}
                                onClick={startEditing}
                            >
                                Edit
                            </Button>
                        )}
                        {game.gameState === "FUT" && game.gameCenterLink && (
                            <Button
                                fullWidth
                                size="small"
                                target="_blank"
                                rel="noreferrer"
                                sx={actionButtonStyles}
                                href={`https://www.nhl.com${game.gameCenterLink}`}
                            >
                                Preview
                            </Button>
                        )}
                        {isCompletedGame && game.gameCenterLink && (
                            <Button
                                fullWidth
                                size="small"
                                target="_blank"
                                rel="noreferrer"
                                sx={actionButtonStyles}
                                href={`https://www.nhl.com${game.gameCenterLink}`}
                            >
                                Gamecenter
                            </Button>
                        )}
                        {isCompletedGame && game.condensedGame && (
                            <Button
                                fullWidth
                                size="small"
                                target="_blank"
                                rel="noreferrer"
                                sx={actionButtonStyles}
                                href={`https://www.nhl.com${game.condensedGame}`}
                            >
                                Recap
                            </Button>
                        )}
                    </>
                )}
            </Stack>
        </Card>
    );
};

export default GameCard;
