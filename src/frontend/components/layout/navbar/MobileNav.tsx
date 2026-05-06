import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import {
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../../../../AuthProvider";
import type { Team } from "../../../../interfaces";
import { teams } from "../../../pages/select-team/team-data";
import Avatar from "./avatar/Avatar";

const MobileNav = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return null;
    }

    const team: Team = user.selected_team || teams[0];
    const currentRoute = location.pathname;

    return (
        <Paper
            elevation={0}
            sx={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200,
                display: { xs: "block", md: "none" },
                backgroundColor: "#d114141c",
                backdropFilter: "blur(10px)",
                borderRadius: 0,
            }}
        >
            <BottomNavigation
                value={currentRoute}
                showLabels
                sx={{
                    minHeight: "calc(60px + env(safe-area-inset-bottom))",
                    pb: "env(safe-area-inset-bottom)",
                    backgroundColor: "transparent",
                    alignItems: "stretch",
                    "& .MuiBottomNavigationAction-root": {
                        minWidth: 0,
                        maxWidth: "none",
                        flex: 1,
                        color: alpha("#ffffff", 0.72),
                        borderTop: "solid transparent",
                    },
                    "& .MuiBottomNavigationAction-label": {
                        mt: 1,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                    },
                    "& .MuiBottomNavigationAction-label.Mui-selected": {
                        fontSize: 9,
                    },
                    "& a.Mui-selected": {
                        color: "white",
                        borderTop: "solid white",
                    },
                }}
            >
                <BottomNavigationAction
                    component={RouterLink}
                    to="/home"
                    value="/home"
                    label="Home"
                    icon={
                        <Box
                            component="img"
                            src={team.logo}
                            alt={team.name}
                            sx={{
                                width: 44,
                                height: 27,
                                my: "-2px",
                                display: "block",
                                objectFit: "contain",
                                transform: `scale(${team.selectionLogoScale ?? 0.8})`,
                            }}
                        />
                    }
                />

                <BottomNavigationAction
                    component={RouterLink}
                    to="/standings"
                    value="/standings"
                    label="Standings"
                    icon={<BarChartRoundedIcon />}
                />

                <BottomNavigationAction
                    component={RouterLink}
                    to="/playoffs"
                    value="/playoffs"
                    label="Playoffs"
                    icon={<EmojiEventsRoundedIcon />}
                />

                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        alignItems: "stretch",
                        justifyContent: "center",
                    }}
                >
                    <Avatar variant="mobileNav" />
                </Box>
            </BottomNavigation>
        </Paper>
    );
};

export default MobileNav;
