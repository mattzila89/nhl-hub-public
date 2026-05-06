import { useAuth } from "../../../../AuthProvider";
import type { Team } from "../../../../interfaces";
import { teams } from "../../../pages/select-team/team-data";
import { Link as RouterLink, useLocation } from "react-router-dom";
import Avatar from "./avatar/Avatar";

import { AppBar, Toolbar, Box, Typography, Button, Stack } from "@mui/material";

const NavBar = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const team: Team = user.selected_team || teams[0];

    const logo = team.logo;
    const name = team.name;

    const links = [
        { label: "Home", to: "/home" },
        { label: "Standings", to: "/standings" },
        { label: "Playoffs", to: "/playoffs" },
        // { label: "Bets", to: "/home/bets" }, // 💰 Add later
    ];

    const isActive = (path: string) =>
        location.pathname === path || location.pathname.startsWith(path + "/");

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                background: "transparent",
                display: { xs: "none", md: "block" },
                px: 1,
            }}
            data-testid="nav-bar"
        >
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: "0 !important",
                }}
            >
                {/* LEFT */}
                <Stack
                    direction="row"
                    sx={{ alignItems: "center" }}
                    spacing={1}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt={name}
                        sx={{
                            width: 50,
                            height: 50,
                            objectFit: "contain",
                            transform: `scale(${team.selectionLogoScale ?? 1.2})`,
                        }}
                        data-testid={`team-logo-${team.abbrev}`}
                    />

                    <Typography
                        sx={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: "white",
                            textTransform: "uppercase",
                            fontFamily: "NHLFont, sans-serif",
                        }}
                        data-testid={name}
                    >
                        {name}
                    </Typography>
                </Stack>

                {/* RIGHT */}
                <Stack
                    direction="row"
                    sx={{ alignItems: "center" }}
                    spacing={2.5}
                >
                    {/* LINKS */}
                    <Stack direction="row" spacing={4}>
                        {links.map((link) => {
                            const active = isActive(link.to);

                            return (
                                <Button
                                    key={link.to}
                                    component={RouterLink}
                                    to={link.to}
                                    disableRipple
                                    sx={{
                                        position: "relative",
                                        display: "inline-flex",
                                        width: "auto",
                                        minWidth: "unset",
                                        px: 0,

                                        color: active
                                            ? "white"
                                            : "rgba(255,255,255,0.7)",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        textTransform: "uppercase",

                                        "&:hover": {
                                            color: "white",
                                            background: "transparent",
                                        },

                                        "&::after": {
                                            content: '""',
                                            position: "absolute",
                                            left: -1,
                                            bottom: 7,
                                            width: active ? "100%" : "0%",
                                            height: "2.5px",
                                            background: "white",
                                            transition: "width 0.25s ease",
                                        },

                                        "&:hover::after": {
                                            width: "100%",
                                        },
                                    }}
                                    data-testid={link.label}
                                >
                                    {link.label}
                                </Button>
                            );
                        })}
                    </Stack>

                    {/* AVATAR */}
                    <Avatar />
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
