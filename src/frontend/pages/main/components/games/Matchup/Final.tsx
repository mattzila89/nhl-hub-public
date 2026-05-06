import { Box, Typography } from "@mui/material";
import type { Game } from "../../../utils/game.types";

const Final = ({ game }: { game: Game }) => {
    const suffix = game.gameOutcome?.lastPeriodType;
    const gameStatus = suffix && suffix !== "REG" ? `Final/${suffix}` : "Final";
    return (
        <Box
            sx={{
                textAlign: "center",
                ml: 1,
                mr: 2,
            }}
        >
            <Typography
                sx={{
                    background: "#fff",
                    p: "0 4px",
                    fontSize: 14,
                    color: "#000",
                    borderRadius: 0.25,
                    mb: "5px",
                    whiteSpace: "nowrap",
                }}
            >
                {gameStatus}
            </Typography>
        </Box>
    );
};

export default Final;
