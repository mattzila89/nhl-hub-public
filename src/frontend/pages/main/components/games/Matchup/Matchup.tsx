import { Box } from "@mui/material";
import type { Game } from "../../../utils/game.types";
import TeamAndScore from "./TeamAndScore";
import Clock from "./Clock";
import { isGameLive, isGameOver } from "../../../utils/utils";
import Final from "./Final";

const Matchup = (props: { game: Game }) => {
    const awayPowerPlay =
        props.game.situation?.awayTeam?.situationDescriptions?.includes("PP") ??
        false;

    const homePowerPlay =
        props.game.situation?.homeTeam?.situationDescriptions?.includes("PP") ??
        false;

    return (
        <Box
            sx={{
                mt: 1,
                display: "flex",
                justifyContent: "space-between",
            }}
        >
            <Box sx={{ width: "100%", mr: 2 }}>
                <TeamAndScore
                    team={props.game.awayTeam}
                    powerPlay={awayPowerPlay}
                />
                <TeamAndScore
                    team={props.game.homeTeam}
                    powerPlay={homePowerPlay}
                />
            </Box>

            {isGameLive(props.game) && props.game.clock && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Clock {...props} />
                </Box>
            )}

            {isGameOver(props.game) && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Final {...props} />
                </Box>
            )}
        </Box>
    );
};

export default Matchup;
