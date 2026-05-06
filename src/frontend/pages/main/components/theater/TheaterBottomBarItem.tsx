import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Game } from "../../utils/game.types";
import { formatGameTime, getPeriodDisplay } from "../../utils/utils";
import { teams } from "../../../select-team/team-data";

type TheaterBottomBarItemProps = {
    game: Game;
};

const teamPrimaryColors = new Map(
    teams.map((team) => [team.abbrev, team.primaryColor]),
);

const getTeamDisplayName = (team: Game["homeTeam"] | Game["awayTeam"]) => {
    if (team.commonName?.default) return team.commonName?.default;

    return team.name?.default ?? team.commonName?.default ?? team.abbrev;
};

const getGameStatusLabel = (game: Game) => {
    if (game.gameState === "LIVE" || game.gameState === "CRIT") {
        return {
            primary: getPeriodDisplay(game),
            secondary: game.clock?.timeRemaining ?? "0:00",
            accent: "#ff3146",
        };
    }

    if (game.gameState === "PRE") {
        return {
            primary: "Pregame",
            secondary: formatGameTime(game.startTimeUTC).replace(" ", ""),
            accent: alpha("#ffffff", 0.82),
        };
    }

    if (game.gameState === "FUT") {
        return {
            primary: formatGameTime(game.startTimeUTC).replace(" ", ""),
            secondary: "",
            accent: alpha("#ffffff", 0.82),
        };
    }

    const suffix = game.gameOutcome?.lastPeriodType;

    return {
        primary: suffix && suffix !== "REG" ? `Final/${suffix}` : "Final",
        secondary: "",
        accent: alpha("#ffffff", 0.82),
    };
};

const getTeamRowBackground = (teamAbbrev: string) => {
    const primaryColor = teamPrimaryColors.get(teamAbbrev) ?? "#1a1a1a";

    return `linear-gradient(90deg, ${alpha(primaryColor, 0.98)} 0%, ${alpha(primaryColor, 0.9)} 62%, ${alpha("#000000", 0.45)} 100%)`;
};

const TheaterBottomBarItem = ({ game }: TheaterBottomBarItemProps) => {
    const status = getGameStatusLabel(game);

    return (
        <Box
            sx={{
                minWidth: { md: 320, lg: 360 },
                maxWidth: { md: 320, lg: 360 },
                borderRadius: 0,
                background: `linear-gradient(135deg, ${alpha("#050505", 0.96)} 0%, ${alpha("#161616", 0.9)} 100%)`,
                boxShadow: "0 14px 26px rgba(0, 0, 0, 0.28)",
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
            }}
        >
            <Stack spacing={0}>
                {[game.awayTeam, game.homeTeam].map((team) => (
                    <Box
                        key={`${game.id}-${team.abbrev}`}
                        sx={{
                            minWidth: 0,
                            display: "grid",
                            gridTemplateColumns: "auto minmax(0, 1fr) auto",
                            alignItems: "center",
                            gap: 1,
                            height: "auto",
                            background: getTeamRowBackground(team.abbrev),
                        }}
                    >
                        <Box
                            sx={{
                                width: 96,
                                height: 54,
                                overflow: "hidden",
                                position: "relative",
                            }}
                        >
                            <Box
                                component="img"
                                src={team.logo}
                                alt={team.name?.default ?? team.abbrev}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: -34,
                                    width: 155,
                                    height: 107,
                                    transform: "translateY(-50%)",
                                    objectFit: "contain",
                                    flexShrink: 0,
                                }}
                            />
                        </Box>

                        <Typography
                            variant="subtitle2"
                            noWrap
                            sx={{
                                fontSize: { md: 16, lg: 18 },
                                letterSpacing: "0.04em",
                                color: "#ffffff",
                            }}
                        >
                            {getTeamDisplayName(team)}
                        </Typography>

                        {typeof team.score === "number" && (
                            <Typography
                                variant="h4"
                                sx={{
                                    minWidth: 23,
                                    textAlign: "center",

                                    fontSize: { md: 28, lg: 32 },
                                    color: "#ffffff",
                                }}
                            >
                                {team.score}
                            </Typography>
                        )}
                    </Box>
                ))}
            </Stack>

            <Stack
                spacing={0.75}
                sx={{
                    minWidth: 92,
                    px: 1.25,
                    py: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#050505",
                }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 0.25,

                        fontSize: 14,
                        color: "#000",
                        backgroundColor: " #ffffff",
                        whiteSpace: "nowrap",
                    }}
                >
                    {status.primary}
                </Typography>

                {status.secondary ? (
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: 22,
                            lineHeight: 1,
                            color: "#ffffff",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {status.secondary}
                    </Typography>
                ) : null}
            </Stack>
        </Box>
    );
};

export default TheaterBottomBarItem;
