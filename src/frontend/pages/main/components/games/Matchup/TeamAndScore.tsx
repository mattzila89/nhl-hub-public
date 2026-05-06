import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import type { Game } from "../../../utils/game.types";
import { useAppropriateLogo } from "../../../utils/utils";

const TeamAndScore = ({
    team,
    powerPlay = false,
}: {
    team: Game["awayTeam"] | Game["homeTeam"];
    powerPlay?: boolean;
}) => {
    const theme = useTheme();
    const isMobileViewport = useMediaQuery("(max-width: 768px)");
    return (
        <Box
            sx={{
                justifyContent: "space-between",
                display: "flex",
            }}
        >
            <Box
                sx={{
                    alignItems: "center",
                    display: "flex",
                }}
            >
                <img
                    style={{ width: 60, height: 35 }}
                    src={useAppropriateLogo(team)}
                />
                <Typography
                    variant="h6"
                    sx={{
                        fontSize: isMobileViewport ? 16 : 18,
                        pt: "2px",
                    }}
                >
                    {team.name?.default || team.commonName?.default}
                </Typography>
                {powerPlay && (
                    <Typography
                        sx={{
                            background: theme.palette.error.main,
                            borderRadius: 0.2,
                            fontSize: 12,
                            ml: "4px",
                            p: "0 3px",
                            pt: "2px",
                        }}
                    >
                        PP
                    </Typography>
                )}
            </Box>
            <Box
                sx={{
                    textAlign: "center",
                    minWidth: 18,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontSize: 22,
                    }}
                >
                    {team.score}
                </Typography>
            </Box>
        </Box>
    );
};

export default TeamAndScore;
