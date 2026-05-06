import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { teams } from "../../../select-team/team-data";
import type { PlayoffSeries } from "../../utils/playoffs.types";

type PlayoffMobileBracketProps = {
    accentColor: string;
    bracketLogo?: string;
    seriesByLetter: Map<string, PlayoffSeries>;
};

type MobileSlotVariant = "round1" | "round2" | "conference" | "final";

type MobileSlot = {
    seriesLetter: string;
    label?: string;
    labelPosition?: "top" | "bottom";
    variant: MobileSlotVariant;
    left: string;
    top: string;
    width: string;
};

const NHL_LOGO = teams[0].logo;

const mobileSlots: MobileSlot[] = [
    {
        seriesLetter: "E",
        label: "R1",
        labelPosition: "top",
        variant: "round1",
        left: "4.2%",
        top: "5.8%",
        width: "24.2%",
    },
    {
        seriesLetter: "F",
        variant: "round1",
        left: "4.2%",
        top: "24.4%",
        width: "24.2%",
    },
    {
        seriesLetter: "K",
        label: "R2",
        labelPosition: "top",
        variant: "round2",
        left: "30.7%",
        top: "15%",
        width: "15.2%",
    },
    {
        seriesLetter: "I",
        label: "R2",
        labelPosition: "top",
        variant: "round2",
        left: "54.1%",
        top: "15%",
        width: "15.2%",
    },
    {
        seriesLetter: "A",
        label: "R1",
        labelPosition: "top",
        variant: "round1",
        left: "71.6%",
        top: "5.8%",
        width: "24.2%",
    },
    {
        seriesLetter: "B",
        variant: "round1",
        left: "71.6%",
        top: "24.4%",
        width: "24.2%",
    },
    {
        seriesLetter: "N",
        label: "CF",
        labelPosition: "top",
        variant: "conference",
        left: "15.6%",
        top: "45.5%",
        width: "18.2%",
    },
    {
        seriesLetter: "M",
        label: "CF",
        labelPosition: "top",
        variant: "conference",
        left: "66.2%",
        top: "45.5%",
        width: "18.2%",
    },
    {
        seriesLetter: "O",
        variant: "final",
        left: "37.2%",
        top: "39.6%",
        width: "25.6%",
    },
    {
        seriesLetter: "G",
        variant: "round1",
        left: "4.2%",
        top: "65%",
        width: "24.2%",
    },
    {
        seriesLetter: "H",
        label: "R1",
        labelPosition: "bottom",
        variant: "round1",
        left: "4.2%",
        top: "83.6%",
        width: "24.2%",
    },
    {
        seriesLetter: "L",
        label: "R2",
        labelPosition: "bottom",
        variant: "round2",
        left: "30.7%",
        top: "72.4%",
        width: "15.2%",
    },
    {
        seriesLetter: "J",
        label: "R2",
        labelPosition: "bottom",
        variant: "round2",
        left: "54.1%",
        top: "72.4%",
        width: "15.2%",
    },
    {
        seriesLetter: "C",
        variant: "round1",
        left: "71.6%",
        top: "65%",
        width: "24.2%",
    },
    {
        seriesLetter: "D",
        label: "R1",
        labelPosition: "bottom",
        variant: "round1",
        left: "71.6%",
        top: "83.6%",
        width: "24.2%",
    },
];

const getCardAspectRatio = (variant: MobileSlotVariant) => {
    switch (variant) {
        case "round1":
            return "0";
        case "round2":
            return "0.72 / 1";
        case "conference":
            return "1.34 / 1";
        case "final":
            return "0.7 / 1";
    }
};

const getConferenceTitleParts = (series?: PlayoffSeries) => {
    const title = series?.seriesTitle?.trim() || "Conference Final";
    const normalizedTitle = title.toUpperCase();

    if (normalizedTitle.includes("WESTERN")) {
        return ["WESTERN", "CONFERENCE FINAL"];
    }

    if (normalizedTitle.includes("EASTERN")) {
        return ["EASTERN", "CONFERENCE FINAL"];
    }

    return [normalizedTitle, ""];
};

const MobileRoundLabel = ({ children }: { children: string }) => (
    <Typography
        sx={{
            color: "#ffffff",
            fontSize: { xs: 14, sm: 16 },
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: 0,
            textAlign: "center",
            textTransform: "uppercase",
            textShadow: `0 2px 10px ${alpha("#000000", 0.36)}`,
            "@media (max-width: 370px)": {
                fontSize: 13,
            },
        }}
    >
        {children}
    </Typography>
);

const MobileTeamRow = ({
    seed,
    team,
    wins,
}: {
    seed: string;
    team: NonNullable<PlayoffSeries["topSeedTeam"]>;
    wins: number;
}) => (
    <Box
        sx={{
            display: "grid",
            gridTemplateColumns: {
                xs: "31px minmax(34px, auto) 20px",
                sm: "38px minmax(42px, auto) 25px",
            },
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 0.65, sm: 0.8 },
            width: "100%",
            minWidth: 0,
            "@media (max-width: 370px)": {
                gridTemplateColumns: "28px minmax(31px, auto) 18px",
                gap: 0.5,
            },
        }}
    >
        <Box
            component="img"
            src={team.logo || team.darkLogo}
            alt={team.name.default}
            sx={{
                width: { xs: 31, sm: 38 },
                height: { xs: 31, sm: 38 },
                objectFit: "contain",
                "@media (max-width: 370px)": {
                    width: 28,
                    height: 28,
                },
            }}
        />

        <Box sx={{ minWidth: 0 }}>
            <Typography
                noWrap
                sx={{
                    color: alpha("#ffffff", 0.94),
                    fontSize: { xs: 15, sm: 18 },
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: 0,
                    textTransform: "uppercase",
                    "@media (max-width: 370px)": {
                        fontSize: 14,
                    },
                }}
            >
                {team.abbrev}
            </Typography>

            {seed && (
                <Typography
                    noWrap
                    sx={{
                        mt: 0.2,
                        color: alpha("#ffffff", 0.48),
                        fontSize: { xs: 9, sm: 10 },
                        fontWeight: 700,
                        lineHeight: 1,
                        letterSpacing: 0,
                        textTransform: "uppercase",
                        "@media (max-width: 370px)": {
                            fontSize: 8,
                        },
                    }}
                >
                    ({seed})
                </Typography>
            )}
        </Box>

        <Typography
            sx={{
                color: alpha("#ffffff", 0.94),
                fontSize: { xs: 24, sm: 30 },
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: 0,
                textAlign: "center",
                "@media (max-width: 370px)": {
                    fontSize: 22,
                },
            }}
        >
            {wins}
        </Typography>
    </Box>
);

const EmptyMobileSeries = ({
    bracketLogo,
    series,
    variant,
}: {
    bracketLogo?: string;
    series?: PlayoffSeries;
    variant: MobileSlotVariant;
}) => {
    if (variant === "conference") {
        const [primary, secondary] = getConferenceTitleParts(series);

        return (
            <Stack
                sx={{
                    height: "100%",
                    textAlign: "center",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Typography
                    sx={{
                        color: "#ffffff",
                        fontSize: { xs: 12, sm: 15 },
                        fontWeight: 800,
                        lineHeight: 1,
                        letterSpacing: 0,
                        textTransform: "uppercase",
                        "@media (max-width: 370px)": {
                            fontSize: 12,
                        },
                    }}
                >
                    {primary}
                </Typography>
                {secondary && (
                    <Typography
                        sx={{
                            mt: 0.25,
                            color: alpha("#ffffff", 0.52),
                            fontSize: { xs: 7, sm: 8 },
                            fontWeight: 800,
                            lineHeight: 1,
                            letterSpacing: 0,
                            textTransform: "uppercase",
                        }}
                    >
                        {secondary}
                    </Typography>
                )}
            </Stack>
        );
    }

    return (
        <Stack
            sx={{
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Box
                component="img"
                src={variant === "final" ? bracketLogo || NHL_LOGO : NHL_LOGO}
                alt={series?.seriesTitle || "Playoff series"}
                sx={{
                    width:
                        variant === "final"
                            ? { xs: "78%", sm: "82%" }
                            : { xs: "46%", sm: "50%" },
                    maxHeight: variant === "final" ? "82%" : "58%",
                    objectFit: "contain",
                    filter:
                        variant === "final"
                            ? "drop-shadow(0 10px 24px rgba(0,0,0,0.4))"
                            : "grayscale(1) brightness(1.5) opacity(0.14)",
                }}
            />
        </Stack>
    );
};

const MobileSeriesCard = ({
    accentColor,
    bracketLogo,
    series,
    variant,
}: {
    accentColor: string;
    bracketLogo?: string;
    series?: PlayoffSeries;
    variant: MobileSlotVariant;
}) => {
    const topSeedTeam = series?.topSeedTeam;
    const bottomSeedTeam = series?.bottomSeedTeam;
    let cardContent = (
        <EmptyMobileSeries
            bracketLogo={bracketLogo}
            series={series}
            variant={variant}
        />
    );

    if (series && topSeedTeam && bottomSeedTeam) {
        cardContent = (
            <Stack
                spacing={{ xs: 0.55, sm: 0.75 }}
                sx={{
                    height: "100%",
                    justifyContent: "center",
                }}
            >
                <MobileTeamRow
                    team={topSeedTeam}
                    seed={series.topSeedRankAbbrev}
                    wins={series.topSeedWins}
                />
                <Box
                    sx={{
                        borderBottom: `1px solid ${alpha("#ffffff", 0.085)}`,
                    }}
                />
                <MobileTeamRow
                    team={bottomSeedTeam}
                    seed={series.bottomSeedRankAbbrev}
                    wins={series.bottomSeedWins}
                />
            </Stack>
        );
    }

    return (
        <Box
            sx={{
                aspectRatio: getCardAspectRatio(variant),
                borderRadius: 0.5,
                border: `1px solid ${alpha("#ffffff", 0.12)}`,
                background:
                    variant === "round2"
                        ? alpha("#171717", 0.78)
                        : `linear-gradient(180deg, ${alpha("#292929", 0.96)} 0%, ${alpha("#202020", 0.98)} 100%)`,
                boxShadow:
                    variant === "final"
                        ? `0 12px 24px ${alpha("#000000", 0.22)}`
                        : `0 8px 18px ${alpha("#000000", 0.16)}`,
                overflow: "hidden",
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(145deg, ${alpha(accentColor, variant === "final" ? 0.08 : 0.045)} 0%, transparent 42%)`,
                    pointerEvents: "none",
                },
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    zIndex: 1,
                    height: "100%",
                    p:
                        variant === "round1"
                            ? { xs: 0.75, sm: 1 }
                            : { xs: 0.6, sm: 0.8 },
                    "@media (max-width: 370px)": {
                        p: variant === "round1" ? 0.55 : 0.45,
                    },
                }}
            >
                {cardContent}
            </Box>
        </Box>
    );
};

const MobileSlotView = ({
    accentColor,
    bracketLogo,
    series,
    slot,
}: {
    accentColor: string;
    bracketLogo?: string;
    series?: PlayoffSeries;
    slot: MobileSlot;
}) => {
    const labelPosition = slot.labelPosition ?? "top";

    return (
        <Stack
            spacing={{ xs: 0.55, sm: 0.7 }}
            sx={{
                position: "absolute",
                left: slot.left,
                top: slot.top,
                width: slot.width,
            }}
        >
            {slot.label && labelPosition === "top" && (
                <MobileRoundLabel>{slot.label}</MobileRoundLabel>
            )}

            <MobileSeriesCard
                accentColor={accentColor}
                bracketLogo={bracketLogo}
                series={series}
                variant={slot.variant}
            />

            {slot.label && labelPosition === "bottom" && (
                <MobileRoundLabel>{slot.label}</MobileRoundLabel>
            )}
        </Stack>
    );
};

const PlayoffMobileBracket = ({
    accentColor,
    bracketLogo,
    seriesByLetter,
}: PlayoffMobileBracketProps) => (
    <Box
        sx={{
            display: { xs: "block", md: "none" },
            width: "100%",
            maxWidth: 520,
            mx: "auto",
            pb: "calc(110px + env(safe-area-inset-bottom))",
        }}
    >
        <Box
            sx={{
                position: "relative",
                width: "100%",
                aspectRatio: "1179 / 1810",
                borderRadius: 0,
                overflow: "hidden",
            }}
        >
            {mobileSlots.map((slot) => (
                <MobileSlotView
                    key={slot.seriesLetter}
                    accentColor={accentColor}
                    bracketLogo={bracketLogo}
                    series={seriesByLetter.get(slot.seriesLetter)}
                    slot={slot}
                />
            ))}
        </Box>
    </Box>
);

export default PlayoffMobileBracket;
