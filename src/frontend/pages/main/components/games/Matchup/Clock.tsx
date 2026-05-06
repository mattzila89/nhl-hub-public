import { Box, Divider, Typography } from "@mui/material";
import type { Game } from "../../../utils/game.types";
import { getPeriodDisplay } from "../../../utils/utils";
import { keyframes, styled } from "@mui/material";

const pingPong = keyframes`
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
`;

const LiveDivider = styled("div")({
    position: "relative",
    height: 2,
    width: "100%",
    background: "rgba(255,255,255,0.15)",
    overflow: "hidden",
    borderRadius: 2,

    "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: "-30%", // start fully off-screen
        height: "100%",
        width: "100%",
        background: "#f44336",
        borderRadius: 2,

        animation: `${pingPong} 1.2s ease-in-out infinite alternate`,
    },
});

const Clock = ({ game }: { game: Game }) => {
    return (
        <Box sx={{ textAlign: "center", ml: 1, mr: 2 }}>
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
                {getPeriodDisplay(game)}
            </Typography>
            {game.clock?.inIntermission ? (
                <Divider sx={{ borderColor: "#949494", borderWidth: 1 }} />
            ) : (
                <LiveDivider />
            )}
            <Typography sx={{ fontSize: 18 }}>
                {game.clock?.timeRemaining || "0:00"}
            </Typography>
        </Box>
    );
};

export default Clock;
