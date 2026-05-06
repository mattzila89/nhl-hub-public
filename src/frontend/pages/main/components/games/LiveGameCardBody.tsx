import { Box } from "@mui/material";
import GameStatus from "./GameStatus/GameStatus";
import Matchup from "./Matchup/Matchup";
import type { Game } from "../../utils/game.types";
import HighlighVideoUrlEditor from "./HighlighVideoUrlEditor";

type LiveGameCardBodyProps = {
    game: Game;
    editing: boolean;
    isSelected: boolean;
    selectedIndex: number;
    streamUrl: string;
    onStreamUrlChange: (value: string) => void;
    streamSaveError?: string;
};

const LiveGameCardBody = ({
    game,
    editing,
    isSelected,
    selectedIndex,
    streamUrl,
    onStreamUrlChange,
    streamSaveError,
}: LiveGameCardBodyProps) => {
    if (editing) {
        return (
            <HighlighVideoUrlEditor
                streamUrl={streamUrl}
                onStreamUrlChange={onStreamUrlChange}
                streamSaveError={streamSaveError}
            />
        );
    }

    return (
        <Box>
            <GameStatus
                game={game}
                streamUrl={streamUrl}
                isSelected={isSelected}
                selectedIndex={selectedIndex}
            />
            <Matchup game={game} />
        </Box>
    );
};

export default LiveGameCardBody;
