import * as React from "react";
import { Alert, Box, Fade, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../../../AuthProvider";
import type { MainLayoutContext } from "../../../components/layout/AppLayout";
import PlayoffSeriesCard from "../components/playoffs/PlayoffSeriesCard";
import PlayoffMobileBracket from "../components/playoffs/PlayoffMobileBracket";
import {
    PLAYOFF_BRACKET_YEAR,
    playoffBracketSlots,
} from "../components/playoffs/playoffs.constants";
import PlayoffsService from "../../../services/PlayoffsService";

const Playoffs = () => {
    const { chatOpen } = useOutletContext<MainLayoutContext>();
    const { user } = useAuth();
    const bracketQuery = PlayoffsService.useBracket(PLAYOFF_BRACKET_YEAR);
    const accentColor = user?.selected_team?.primaryColor ?? "#c8102e";
    const bracketViewportRef = React.useRef<HTMLDivElement | null>(null);
    const bracketGridRef = React.useRef<HTMLDivElement | null>(null);
    const [bracketScale, setBracketScale] = React.useState(1);
    const [scaledBracketSize, setScaledBracketSize] = React.useState({
        width: 0,
        height: 0,
    });
    const hasBracketData =
        !bracketQuery.isPending &&
        !bracketQuery.isError &&
        Boolean(bracketQuery.data);

    const seriesByLetter = React.useMemo(() => {
        return new Map(
            (bracketQuery.data?.series ?? []).map((series) => [
                series.seriesLetter,
                series,
            ]),
        );
    }, [bracketQuery.data?.series]);

    const updateBracketScale = React.useCallback(() => {
        const viewport = bracketViewportRef.current;
        const grid = bracketGridRef.current;

        if (!viewport || !grid) {
            return;
        }

        const nextWidth = grid.offsetWidth;
        const nextHeight = grid.offsetHeight;

        if (!nextWidth || !nextHeight) {
            return;
        }

        const availableWidth = viewport.clientWidth;
        const nextScale = availableWidth / nextWidth;

        setBracketScale(nextScale);
        setScaledBracketSize({
            width: nextWidth * nextScale,
            height: nextHeight * nextScale,
        });
    }, []);

    React.useEffect(() => {
        updateBracketScale();

        const viewport = bracketViewportRef.current;
        const grid = bracketGridRef.current;

        if (!viewport || !grid || typeof ResizeObserver === "undefined") {
            return;
        }

        let frameId = 0;
        const observer = new ResizeObserver(() => {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(updateBracketScale);
        });

        observer.observe(viewport);
        observer.observe(grid);

        return () => {
            window.cancelAnimationFrame(frameId);
            observer.disconnect();
        };
    }, [updateBracketScale, bracketQuery.data]);

    return (
        <Box
            sx={{
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                scrollbarGutter: "stable",
                pb: {
                    xs: "calc(96px + env(safe-area-inset-bottom))",
                    md: "calc(3px + env(safe-area-inset-bottom))",
                },
            }}
            data-testid="playoffs"
        >
            <Stack
                spacing={2.25}
                sx={{
                    px: { xs: 0, sm: 0.5, md: 0 },
                    pr: {
                        xs: 0,
                        sm: 0.5,
                        xl: chatOpen ? 0.5 : 0,
                    },
                }}
            >
                {bracketQuery.isPending && (
                    <Alert severity="info">Loading playoff bracket...</Alert>
                )}

                {bracketQuery.isError && (
                    <Alert severity="error">
                        {bracketQuery.error instanceof Error
                            ? bracketQuery.error.message
                            : "Unable to load playoff bracket"}
                    </Alert>
                )}

                {hasBracketData && (
                    <Fade in={hasBracketData} timeout={360}>
                        <Box>
                            <Stack
                                spacing={0.8}
                                sx={{
                                    display: { xs: "none", md: "flex" },
                                    textAlign: "center",
                                    alignItems: "center",
                                }}
                            >
                                {bracketQuery.data?.bracketLogo && (
                                    <Box
                                        component="img"
                                        src={bracketQuery.data.bracketLogo}
                                        alt={`${PLAYOFF_BRACKET_YEAR} Stanley Cup Playoffs`}
                                        sx={{
                                            width: { xs: 250, sm: 320 },
                                            maxWidth: "100%",
                                            objectFit: "contain",
                                        }}
                                        data-testid="bracket-logo"
                                    />
                                )}

                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            letterSpacing: "0.03em",
                                            textTransform: "uppercase",
                                            color: "#ffffff",
                                            fontSize: 24,
                                        }}
                                    >
                                        {bracketQuery.data?.bracketTitle
                                            .default ??
                                            `${PLAYOFF_BRACKET_YEAR} Playoff Bracket`}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 0.4,
                                            color: alpha("#ffffff", 0.72),
                                            fontSize: 14,
                                        }}
                                    >
                                        {bracketQuery.data?.bracketSubTitle
                                            .default ??
                                            "Series update after each game ends."}
                                    </Typography>
                                </Box>
                            </Stack>

                            <PlayoffMobileBracket
                                accentColor={accentColor}
                                bracketLogo={bracketQuery.data?.bracketLogo}
                                seriesByLetter={seriesByLetter}
                            />

                            <Box
                                ref={bracketViewportRef}
                                sx={{
                                    display: { xs: "none", md: "flex" },
                                    width: "100%",
                                    overflow: "hidden",
                                    pb: 1.5,
                                    mx: 0,
                                    mt: 2.25,
                                    justifyContent: "center",
                                    alignItems: "flex-start",
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "relative",
                                        width:
                                            scaledBracketSize.width || "100%",
                                        height:
                                            scaledBracketSize.height || 1100,
                                    }}
                                >
                                    <Box
                                        ref={bracketGridRef}
                                        sx={{
                                            width: "fit-content",
                                            minWidth: 1520,
                                            display: "grid",
                                            gridTemplateColumns:
                                                "250px 250px 260px 260px 260px 250px 250px",
                                            gridTemplateRows:
                                                "repeat(8, minmax(112px, auto))",
                                            columnGap: 2.5,
                                            rowGap: 2.5,
                                            alignItems: "stretch",
                                            px: { xs: 1.5, sm: 0.25, md: 0 },
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            transform: `scale(${bracketScale})`,
                                            transformOrigin: "top left",
                                        }}
                                    >
                                        {playoffBracketSlots.map((slot) => {
                                            const series = seriesByLetter.get(
                                                slot.seriesLetter,
                                            );

                                            if (!series) {
                                                return null;
                                            }

                                            return (
                                                <Box
                                                    key={slot.seriesLetter}
                                                    sx={{
                                                        gridColumn: String(
                                                            slot.column,
                                                        ),
                                                        gridRow: slot.rowSpan
                                                            ? `${slot.row} / span ${slot.rowSpan}`
                                                            : String(slot.row),
                                                    }}
                                                    data-testid="bracket-slot"
                                                >
                                                    <PlayoffSeriesCard
                                                        series={series}
                                                        size={slot.size}
                                                        accentColor={
                                                            accentColor
                                                        }
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                )}
            </Stack>
        </Box>
    );
};

export default Playoffs;
