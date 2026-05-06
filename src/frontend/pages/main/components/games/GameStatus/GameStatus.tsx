import { Box, Chip, keyframes, styled, Typography } from "@mui/material";
import type { Game } from "../../../utils/game.types";
import { formatGameTime } from "../../../utils/utils";
import Sensors from "@mui/icons-material/Sensors";
import LinkRounded from "@mui/icons-material/LinkRounded";
import TVNetworks from "./TVNetworks";
import { useAuth } from "../../../../../../AuthProvider";

const pulseRing = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.6);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
`;

const IconWrapper = styled("span")({
    position: "absolute",
    top: 13,
    left: 55,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

const PulseDot = styled("span")({
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: "50%",
    zIndex: 1,
    backgroundColor: "#f44336",
    animation: `${pulseRing} 1.5s ease-out infinite`,
});

const PulsingIcon = styled(Sensors)(({ theme }) => ({
    color: theme.palette.error.main,
    fontSize: 20,
    position: "absolute",
}));

interface GameStatusProps {
    game: Game;
    selectedIndex?: number;
    isSelected?: boolean;
    streamUrl?: string;
}

const GameStatus = ({
    game,
    selectedIndex,
    isSelected = false,
    streamUrl,
}: GameStatusProps): React.ReactNode => {
    const { isAdmin } = useAuth();
    const streamIndicator =
        streamUrl && isAdmin && game.gameState === "FUT" ? (
            <Chip
                icon={<LinkRounded sx={{ color: "#fff !important" }} />}
                size="small"
                component="a"
                href={streamUrl}
                target="_blank"
                clickable
                sx={{
                    color: "#fff",
                    height: 21,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    "& .MuiChip-label": {
                        pl: 0,
                        pr: "8px",
                    },
                }}
            />
        ) : null;

    if (game.gameState === "LIVE" || game.gameState === "CRIT") {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 0,
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        width: "fit-content",
                        py: 0,
                        px: 1.25,
                        position: "relative",
                    }}
                >
                    Live
                    <IconWrapper>
                        <PulseDot />
                        <PulsingIcon />
                    </IconWrapper>
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    {!isSelected && (
                        <TVNetworks broadcasts={game.tvBroadcasts} />
                    )}
                    {isSelected && (
                        <Chip
                            label={`${selectedIndex} of 4`}
                            sx={{ color: "#fff" }}
                        />
                    )}
                </Box>
            </Box>
        );
    }

    let gameStatus = "";
    if (game.gameState === "PRE") {
        gameStatus = "Pregame";
    }
    if (game.gameState === "OFF" || game.gameState === "FINAL") {
        const suffix = game.gameOutcome?.lastPeriodType;
        gameStatus = suffix && suffix !== "REG" ? `Final/${suffix}` : "Final";
    }

    if (game.gameState === "FUT") {
        gameStatus = formatGameTime(game.startTimeUTC, true);
    }

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        width: "fit-content",
                        py: 0,
                        px: 1.25,
                    }}
                >
                    {gameStatus}
                </Typography>
                {streamIndicator}
            </Box>
            {!isSelected && <TVNetworks broadcasts={game.tvBroadcasts} />}
            {isSelected && (
                <Chip label={`${selectedIndex} of 4`} sx={{ color: "#fff" }} />
            )}
        </Box>
    );
};

export default GameStatus;
