import * as React from "react";
import { Alert, Box, Fade, Stack } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../../../AuthProvider";
import type { MainLayoutContext } from "../../../components/layout/AppLayout";
import StandingsTable from "../components/standings/StandingsTable";
import {
    conferenceLabelByCode,
    conferenceOrder,
    divisionLabelByCode,
    divisionOrder,
    sortDivisionStandings,
    sortWildCardStandings,
} from "../components/standings/standings.constants";
import StandingsService from "../../../services/StandingsService";
import type { StandingEntry } from "../utils/standings.types";

type StandingsSection = {
    key: string;
    title: string;
    standings: StandingEntry[];
    highlightTopCount?: number;
    cutoffAfter?: number;
};

const Standings = () => {
    const { chatOpen } = useOutletContext<MainLayoutContext>();
    const { user } = useAuth();
    const standingsQuery = StandingsService.useStandings();
    const headerColor = user?.selected_team?.primaryColor ?? "#c8102e";

    const divisionTables = React.useMemo<StandingsSection[]>(() => {
        const standings = standingsQuery.data?.standings ?? [];

        return divisionOrder.map((divisionCode) => ({
            key: divisionCode,
            title: divisionLabelByCode[divisionCode],
            standings: standings
                .filter((standing) => standing.divisionAbbrev === divisionCode)
                .sort(sortDivisionStandings),
        }));
    }, [standingsQuery.data?.standings]);

    const wildCardTables = React.useMemo<StandingsSection[]>(() => {
        const standings = standingsQuery.data?.standings ?? [];

        return conferenceOrder.map((conferenceCode) => ({
            key: `${conferenceCode}-wild-card`,
            title: conferenceLabelByCode[conferenceCode],
            standings: standings
                .filter(
                    (standing) =>
                        standing.conferenceAbbrev === conferenceCode &&
                        standing.divisionSequence > 3,
                )
                .sort(sortWildCardStandings),
            highlightTopCount: 2,
            cutoffAfter: 2,
        }));
    }, [standingsQuery.data?.standings]);

    const allTables = [...divisionTables, ...wildCardTables];
    const hasStandingsData =
        !standingsQuery.isPending &&
        !standingsQuery.isError &&
        Boolean(standingsQuery.data);

    return (
        <Box
            sx={{
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                scrollbarGutter: "stable",
                pb: {
                    xs: "calc(72px + env(safe-area-inset-bottom))",
                    md: "calc(3px + env(safe-area-inset-bottom))",
                },
            }}
            data-testid="standings"
        >
            <Stack
                spacing={2.25}
                sx={{
                    px: { xs: 1.5, sm: 0.5, md: 0 },
                    pr: {
                        xs: 1.5,
                        sm: 0.5,
                        xl: chatOpen ? 0.5 : 0,
                    },
                }}
            >
                {standingsQuery.isPending && (
                    <Alert severity="info">Loading standings...</Alert>
                )}

                {standingsQuery.isError && (
                    <Alert severity="error">
                        {standingsQuery.error instanceof Error
                            ? standingsQuery.error.message
                            : "Unable to load standings"}
                    </Alert>
                )}

                {hasStandingsData && (
                    <Fade in={hasStandingsData} timeout={320}>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
                                gap: { xs: 2, xl: 2.25 },
                                pb: {
                                    xs: "calc(28px + env(safe-area-inset-bottom))",
                                    md: "calc(12px + env(safe-area-inset-bottom))",
                                },
                                alignItems: "start",
                            }}
                        >
                            {allTables.map((table) => (
                                <StandingsTable
                                    key={table.key}
                                    title={table.title}
                                    standings={table.standings}
                                    headerColor={headerColor}
                                    highlightTopCount={table.highlightTopCount}
                                    cutoffAfter={table.cutoffAfter}
                                />
                            ))}
                        </Box>
                    </Fade>
                )}
            </Stack>
        </Box>
    );
};

export default Standings;
