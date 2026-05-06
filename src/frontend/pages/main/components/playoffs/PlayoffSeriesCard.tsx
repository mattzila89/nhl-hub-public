import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { teams } from "../../../select-team/team-data";
import type { PlayoffSeries } from "../../utils/playoffs.types";
import type { BracketCardSize } from "./playoffs.constants";

type PlayoffSeriesCardProps = {
    series: PlayoffSeries;
    size: BracketCardSize;
    accentColor: string;
};

const PLACEHOLDER_LOGO = teams[0].logo;

const sizeStyles: Record<
    BracketCardSize,
    { minHeight: number; logoWidth: number; panelPx: number }
> = {
    round1: {
        minHeight: 142,
        logoWidth: 28,
        panelPx: 2,
    },
    round2: {
        minHeight: 182,
        logoWidth: 78,
        panelPx: 2.5,
    },
    conference: {
        minHeight: 188,
        logoWidth: 138,
        panelPx: 2.5,
    },
    final: {
        minHeight: 248,
        logoWidth: 176,
        panelPx: 3,
    },
};

const PlayoffSeriesCard = ({
    series,
    size,
    accentColor,
}: PlayoffSeriesCardProps) => {
    const style = sizeStyles[size];
    const hasTeams = Boolean(series.topSeedTeam && series.bottomSeedTeam);
    const displayLogo = series.seriesLogo || PLACEHOLDER_LOGO;

    return (
        <Stack spacing={0.65} sx={{ height: "100%" }}>
            <Typography
                align="center"
                sx={{
                    fontSize: 16,
                    lineHeight: 1,
                    letterSpacing: "0.08em",
                    color: alpha("#ffffff", 0.72),
                    textTransform: "uppercase",
                }}
            >
                {series.seriesAbbrev}
            </Typography>

            <Box
                sx={{
                    height: "100%",
                    minHeight: style.minHeight,
                    px: style.panelPx,
                    py: size === "final" ? 2.4 : 1.8,
                    borderRadius: 1.4,
                    border: `1px solid ${alpha("#ffffff", 0.14)}`,
                    background: `linear-gradient(180deg, ${alpha("#212121", 0.96)} 0%, ${alpha("#171717", 0.98)} 100%)`,
                    boxShadow: `0 16px 40px ${alpha("#000000", 0.28)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(145deg, ${alpha(accentColor, 0.1)} 0%, transparent 30%, transparent 100%)`,
                        pointerEvents: "none",
                    },
                }}
            >
                {hasTeams ? (
                    <Stack spacing={1.15} sx={{ width: "100%", zIndex: 1 }}>
                        {[
                            {
                                team: series.topSeedTeam,
                                seed: series.topSeedRankAbbrev,
                                wins: series.topSeedWins,
                            },
                            {
                                team: series.bottomSeedTeam,
                                seed: series.bottomSeedRankAbbrev,
                                wins: series.bottomSeedWins,
                            },
                        ].map(({ team, seed, wins }, index) => (
                            <Box
                                key={`${series.seriesLetter}-${team?.abbrev}-${seed}`}
                            >
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "36px minmax(0, 1fr) auto",
                                        alignItems: "center",
                                        gap: 1.1,
                                        minWidth: 0,
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={team?.logo}
                                        alt={team?.name.default}
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            objectFit: "contain",
                                        }}
                                        data-testid="team-logo"
                                    />

                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            noWrap
                                            sx={{
                                                fontSize: 25,
                                                lineHeight: 1,
                                                color: "#ffffff",
                                                letterSpacing: "0.03em",
                                                textTransform: "uppercase",
                                            }}
                                            data-testid="team-abbrev"
                                        >
                                            {team?.abbrev}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                mt: 0.2,

                                                fontSize: 12,
                                                lineHeight: 1,
                                                color: alpha("#ffffff", 0.62),
                                                letterSpacing: "0.04em",
                                            }}
                                            data-testid="team-seed"
                                        >
                                            ({seed})
                                        </Typography>
                                    </Box>

                                    <Typography
                                        sx={{
                                            minWidth: 28,
                                            textAlign: "center",

                                            fontSize: 34,
                                            lineHeight: 1,
                                            color: "#ffffff",
                                        }}
                                        data-testid="team-wins"
                                    >
                                        {wins}
                                    </Typography>
                                </Box>

                                {index === 0 && (
                                    <Box
                                        sx={{
                                            mt: 1.05,
                                            borderBottom: `1px solid ${alpha("#ffffff", 0.12)}`,
                                        }}
                                    />
                                )}
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <Stack
                        spacing={1.2}
                        sx={{
                            zIndex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Box
                            component="img"
                            src={displayLogo}
                            alt={series.seriesTitle}
                            sx={{
                                width: style.logoWidth,
                                maxWidth: "100%",
                                objectFit: "contain",
                                filter:
                                    series.seriesLogo || size === "final"
                                        ? "none"
                                        : "grayscale(1) brightness(1.6) opacity(0.2)",
                            }}
                        />

                        {!series.seriesLogo && size !== "final" && (
                            <Typography
                                sx={{
                                    fontSize: 15,
                                    lineHeight: 1,
                                    color: alpha("#ffffff", 0.66),
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                }}
                            >
                                {series.seriesTitle}
                            </Typography>
                        )}
                    </Stack>
                )}
            </Box>
        </Stack>
    );
};

export default PlayoffSeriesCard;
