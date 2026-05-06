import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { teamBrandByAbbrev } from "./standings.constants";
import type { StandingEntry } from "../../utils/standings.types";

type StandingsTableProps = {
    title: string;
    standings: StandingEntry[];
    headerColor: string;
    highlightTopCount?: number;
    cutoffAfter?: number;
};

const columns = [
    {
        id: "position",
        label: "POS",
        align: "center" as const,
        width: "clamp(36px, 8vw, 56px)",
    },
    { id: "team", label: "Team", align: "left" as const, width: "auto" },
    {
        id: "gamesPlayed",
        label: "GP",
        align: "center" as const,
        width: "clamp(30px, 7vw, 46px)",
    },
    {
        id: "wins",
        label: "W",
        align: "center" as const,
        width: "clamp(30px, 7vw, 46px)",
    },
    {
        id: "losses",
        label: "L",
        align: "center" as const,
        width: "clamp(30px, 7vw, 46px)",
    },
    {
        id: "otLosses",
        label: "OTL",
        align: "center" as const,
        width: "clamp(38px, 9vw, 54px)",
    },
    {
        id: "points",
        label: "PTS",
        align: "center" as const,
        width: "clamp(38px, 9vw, 54px)",
    },
];

const getTeamLabel = (standing: StandingEntry) => {
    return standing.placeName.default || standing.teamName.default;
};

const StandingsTable = ({
    title,
    standings,
    headerColor,
    highlightTopCount = 0,
    cutoffAfter,
}: StandingsTableProps) => {
    const theme = useTheme();
    const headerTextColor = theme.palette.getContrastText(headerColor);

    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography
                variant="h6"
                sx={{
                    mb: 1,

                    lineHeight: 1,
                    letterSpacing: "0.03em",
                    color: "#ffffff",
                    textTransform: "uppercase",
                }}
                data-testid="standings-table"
            >
                {title}
            </Typography>

            <TableContainer
                sx={{
                    overflowX: "hidden",
                    borderRadius: 0.75,
                    backgroundColor: alpha("#ffffff", 0.78),
                    boxShadow: `0 12px 28px ${alpha("#000000", 0.14)}`,
                    backdropFilter: "blur(12px)",
                }}
            >
                <Table
                    size="small"
                    sx={{
                        width: "100%",
                        minWidth: 0,
                        tableLayout: "fixed",
                    }}
                >
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    sx={{
                                        width: column.width,
                                        borderBottom: 0,
                                        backgroundColor: headerColor,
                                        color: headerTextColor,
                                        fontSize: {
                                            xs: 10,
                                            sm: 12,
                                            md: 14,
                                        },
                                        fontWeight: 800,
                                        letterSpacing: "0.05em",
                                        textTransform: "uppercase",
                                        whiteSpace: "nowrap",
                                        py: { xs: 1.05, sm: 1.35, md: 1.55 },
                                        px:
                                            column.id === "team"
                                                ? { xs: 0.75, sm: 1.1, md: 1.5 }
                                                : { xs: 0.4, sm: 0.75, md: 1 },
                                    }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {standings.map((standing, index) => {
                            const isHighlighted = index < highlightTopCount;
                            const hasCutoffBorder =
                                cutoffAfter !== undefined &&
                                index === cutoffAfter;
                            const teamBrand = teamBrandByAbbrev.get(
                                standing.teamAbbrev.default,
                            );
                            const logo =
                                teamBrand?.logo.replace("dark", "light") ??
                                standing.teamLogo;
                            const baseBackground =
                                index % 2 === 0
                                    ? alpha("#fff7f4", 0.94)
                                    : alpha("#ffffff", 0.9);
                            const rowBackground = isHighlighted
                                ? alpha(
                                      headerColor,
                                      index % 2 === 0 ? 0.16 : 0.12,
                                  )
                                : baseBackground;

                            return (
                                <TableRow
                                    key={`${standing.conferenceAbbrev}-${standing.teamAbbrev.default}`}
                                    sx={{
                                        backgroundColor: rowBackground,
                                        "&:last-child td": {
                                            borderBottom: 0,
                                        },
                                    }}
                                >
                                    <TableCell
                                        align="center"
                                        sx={{
                                            borderBottom: `1px solid ${alpha("#0f1722", 0.08)}`,
                                            borderTop: hasCutoffBorder
                                                ? `4px solid ${alpha(headerColor, 0.32)}`
                                                : 0,
                                            fontSize: {
                                                xs: 14,
                                                sm: 16,
                                                md: 18,
                                            },
                                            fontWeight: 800,
                                            color: "#111111",
                                            whiteSpace: "nowrap",
                                            py: { xs: 1, sm: 1.35, md: 1.7 },
                                            px: { xs: 0.35, sm: 0.6, md: 1 },
                                        }}
                                    >
                                        {index + 1}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            borderBottom: `1px solid ${alpha("#0f1722", 0.08)}`,
                                            borderTop: hasCutoffBorder
                                                ? `4px solid ${alpha(headerColor, 0.32)}`
                                                : 0,
                                            py: { xs: 0.95, sm: 1.15, md: 1.3 },
                                            px: { xs: 0.6, sm: 1, md: 1.5 },
                                            minWidth: 0,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: {
                                                    xs: 0.5,
                                                    sm: 0.9,
                                                    md: 1.25,
                                                },
                                                minWidth: 0,
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={logo}
                                                alt={standing.teamName.default}
                                                sx={{
                                                    width: {
                                                        xs: 20,
                                                        sm: 26,
                                                        md: 34,
                                                    },
                                                    height: {
                                                        xs: 20,
                                                        sm: 26,
                                                        md: 34,
                                                    },
                                                    objectFit: "contain",
                                                    flexShrink: 0,
                                                }}
                                            />

                                            <Typography
                                                noWrap
                                                sx={{
                                                    display: {
                                                        xs: "none",
                                                        sm: "block",
                                                    },
                                                    fontSize: {
                                                        sm: 14,
                                                        md: 15,
                                                        lg: 17,
                                                    },
                                                    fontWeight: 700,
                                                    color: "#2b2f33",
                                                    fontFamily:
                                                        "ESPNFont-Upright",
                                                    minWidth: 0,
                                                }}
                                            >
                                                {getTeamLabel(standing)}
                                            </Typography>

                                            <Typography
                                                noWrap
                                                sx={{
                                                    display: {
                                                        xs: "block",
                                                        sm: "none",
                                                    },
                                                    fontSize: 13,
                                                    fontWeight: 800,
                                                    letterSpacing: "0.02em",
                                                    color: "#2b2f33",
                                                    fontFamily:
                                                        "ESPNFont-Upright",
                                                    minWidth: 0,
                                                }}
                                            >
                                                {standing.teamAbbrev.default}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell
                                        align="center"
                                        sx={{
                                            borderBottom: `1px solid ${alpha("#0f1722", 0.08)}`,
                                            borderTop: hasCutoffBorder
                                                ? `4px solid ${alpha(headerColor, 0.32)}`
                                                : 0,
                                            fontSize: {
                                                xs: 13,
                                                sm: 14,
                                                md: 16,
                                            },
                                            color: "#181a1d",
                                            whiteSpace: "nowrap",
                                            py: { xs: 1, sm: 1.35, md: 1.55 },
                                            px: { xs: 0.3, sm: 0.55, md: 1 },
                                        }}
                                    >
                                        {standing.gamesPlayed}
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            borderBottom: `1px solid ${alpha("#0f1722", 0.08)}`,
                                            borderTop: hasCutoffBorder
                                                ? `4px solid ${alpha(headerColor, 0.32)}`
                                                : 0,
                                            fontSize: {
                                                xs: 13,
                                                sm: 14,
                                                md: 16,
                                            },
                                            color: "#181a1d",
                                            whiteSpace: "nowrap",
                                            py: { xs: 1, sm: 1.35, md: 1.55 },
                                            px: { xs: 0.3, sm: 0.55, md: 1 },
                                        }}
                                    >
                                        {standing.wins}
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            borderBottom: `1px solid ${alpha("#0f1722", 0.08)}`,
                                            borderTop: hasCutoffBorder
                                                ? `4px solid ${alpha(headerColor, 0.32)}`
                                                : 0,
                                            fontSize: {
                                                xs: 13,
                                                sm: 14,
                                                md: 16,
                                            },
                                            color: "#181a1d",
                                            whiteSpace: "nowrap",
                                            py: { xs: 1, sm: 1.35, md: 1.55 },
                                            px: { xs: 0.3, sm: 0.55, md: 1 },
                                        }}
                                    >
                                        {standing.losses}
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            borderBottom: `1px solid ${alpha("#0f1722", 0.08)}`,
                                            borderTop: hasCutoffBorder
                                                ? `4px solid ${alpha(headerColor, 0.32)}`
                                                : 0,
                                            fontSize: {
                                                xs: 13,
                                                sm: 14,
                                                md: 16,
                                            },
                                            color: "#181a1d",
                                            whiteSpace: "nowrap",
                                            py: { xs: 1, sm: 1.35, md: 1.55 },
                                            px: { xs: 0.3, sm: 0.55, md: 1 },
                                        }}
                                    >
                                        {standing.otLosses}
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            borderBottom: `1px solid ${alpha("#0f1722", 0.08)}`,
                                            borderTop: hasCutoffBorder
                                                ? `4px solid ${alpha(headerColor, 0.32)}`
                                                : 0,
                                            fontSize: {
                                                xs: 14,
                                                sm: 16,
                                                md: 18,
                                            },
                                            fontWeight: 800,
                                            color: "#111111",
                                            whiteSpace: "nowrap",
                                            py: { xs: 1, sm: 1.35, md: 1.55 },
                                            px: { xs: 0.3, sm: 0.55, md: 1 },
                                        }}
                                    >
                                        {standing.points}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StandingsTable;
