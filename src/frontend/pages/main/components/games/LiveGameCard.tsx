import { Card } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useAuth } from "../../../../../AuthProvider";
import GameService from "../../../../services/GamesService";
import type { Game } from "../../utils/game.types";
import LiveGameCardActions from "./LiveGameCardActions";
import LiveGameCardBody from "./LiveGameCardBody";
import { getLiveGameCardStyles } from "./gameCardStyles";
import useVideoEditor from "./useVideoEditor";

type GameCardProps = {
    game: Game;
    isSelected: boolean;
    selectedIndex: number;
    isSelectionLocked: boolean;
    showMultiViewAction: boolean;
    onOpenGame: (gameId: number) => void;
    onToggleMultiView?: (gameId: number) => void;
};

// Shown for LIVE games
const LiveGameCard = ({
    game,
    isSelected,
    selectedIndex,
    isSelectionLocked,
    showMultiViewAction,
    onOpenGame,
    onToggleMultiView,
}: GameCardProps) => {
    const { isAdmin } = useAuth();
    const getLiveGameStats = GameService.useLiveGame(game.id);
    const displayGame = getLiveGameStats.data ?? game;
    const {
        editing,
        isSaving,
        save,
        setStreamUrl,
        startEditing,
        streamSaveError,
        streamUrl,
    } = useVideoEditor(game.id);

    return (
        <Card
            elevation={0}
            sx={(theme: Theme) =>
                getLiveGameCardStyles({
                    theme,
                    isSelected,
                })
            }
            data-testid="live-game-card"
        >
            <LiveGameCardBody
                game={displayGame}
                editing={editing}
                isSelected={isSelected}
                selectedIndex={selectedIndex}
                streamUrl={streamUrl}
                onStreamUrlChange={setStreamUrl}
                streamSaveError={streamSaveError}
            />

            <LiveGameCardActions
                editing={editing}
                isAdmin={isAdmin}
                isSaving={isSaving}
                isSelected={isSelected}
                isSelectionLocked={isSelectionLocked}
                hasStreamUrl={streamUrl.length > 0}
                showMultiViewAction={showMultiViewAction}
                gameId={displayGame.id}
                gameCenterLink={game.gameCenterLink}
                onOpenGame={onOpenGame}
                onToggleMultiView={onToggleMultiView}
                onStartEditing={startEditing}
                onSave={save}
            />
        </Card>
    );
};

export default LiveGameCard;
