import {
    Avatar as AvatarMenu,
    Box,
    Button,
    Menu as MuiMenu,
    Stack,
    Typography,
} from "@mui/material";
import MenuHeader from "./MenuHeader";
import NHLTeamGrid from "../../../../pages/select-team/NHLTeamGrid";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../../AuthProvider";
import { useEffect, useState } from "react";
import type { Team, User } from "../../../../../interfaces";
import { teams } from "../../../../pages/select-team/team-data";
import type { MenuView } from "./Avatar";
import UserService from "../../../../services/UserService";

const Menu = ({
    anchorEl,
    menuView,
    open,
    isMobileNav,
    handleClose,
    setMenuView,
}: {
    anchorEl: HTMLElement | null;
    menuView: MenuView;
    open: boolean;
    isMobileNav: boolean;
    handleClose: () => void;
    setMenuView: React.Dispatch<React.SetStateAction<MenuView>>;
}) => {
    const navigate = useNavigate();
    const { user, logout, setTeam } = useAuth();
    const avatar = user?.avatar_url;
    const [selectedTeam, setSelectedTeam] = useState<Team>(
        user?.selected_team || teams[0],
    );

    // Services
    const logMeOut = UserService.useLogout();
    const selectTeam = UserService.useSelectTeam();

    const useLogOut = async () => {
        try {
            // Remove user session from DB
            await logMeOut.mutateAsync().then(() => {
                // 🧹 clear client session
                logout();
                navigate("/");
            });
        } catch (err) {
            console.error("Failed to logout", err);
        }
    };

    const handleChangeTeam = async () => {
        try {
            await selectTeam.mutateAsync(selectedTeam).then(() => {
                // Update user session
                setTeam({
                    ...user,
                    selected_team: selectedTeam,
                } as User);
            });
        } catch (err) {
            console.error("Failed to save team", err);
        }
    };

    useEffect(() => {
        if (selectedTeam?.id !== user?.selected_team?.id) {
            handleChangeTeam();
        }
    }, [selectedTeam]);

    return (
        <MuiMenu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={
                isMobileNav
                    ? {
                          vertical: "top",
                          horizontal: "right",
                      }
                    : {
                          vertical: "bottom",
                          horizontal: "right",
                      }
            }
            transformOrigin={
                isMobileNav
                    ? {
                          vertical: "bottom",
                          horizontal: "right",
                      }
                    : {
                          vertical: "top",
                          horizontal: "right",
                      }
            }
            slotProps={{
                paper: {
                    elevation: 0,
                    sx: {
                        mt: isMobileNav ? 0 : 1.5,
                        mb: isMobileNav ? 1.5 : 0,
                        backdropFilter: "blur(5px)",
                        background: "rgba(0,0,0,0.2)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow:
                            "0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                        width: menuView === "team" ? 600 : 320,
                        p: 1,
                    },
                },
                list: {
                    sx: {
                        p: 0,
                    },
                },
            }}
        >
            {/* MAIN VIEW */}
            {menuView === "main" && (
                <Box sx={{ pt: 1 }}>
                    <Stack spacing={1} sx={{ alignItems: "center" }}>
                        <AvatarMenu
                            src={avatar}
                            sx={{ width: 80, height: 80 }}
                        />

                        <Typography
                            variant="h6"
                            sx={{
                                color: "white",
                                lineHeight: 1,
                                mt: "12px !important",
                            }}
                        >
                            {user?.name}
                        </Typography>
                        <Typography
                            variant="overline"
                            sx={{
                                color: "#b3b3b3",
                                lineHeight: 1,
                                m: "4px 0 !important",
                            }}
                        >
                            {user?.location}
                        </Typography>

                        {/* <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setMenuView("theme")}
                            sx={{
                                ...menuBtnStyles,
                                p: 1,
                            }}
                        >
                            Change Theme
                        </Button> */}

                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setMenuView("team")}
                            sx={{
                                ...menuBtnStyles,
                                p: 1,
                            }}
                        >
                            Change Team
                        </Button>

                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{
                                ...menuBtnStyles,
                                p: 1,
                            }}
                            onClick={useLogOut}
                        >
                            Log Out
                        </Button>
                    </Stack>
                </Box>
            )}

            {/* THEME VIEW */}
            {/* {menuView === "theme" && (
                <Stack spacing={1}>
                    <MenuHeader
                        title="Change Theme"
                        onBack={() => setMenuView("main")}
                    />

                    <ThemeSelect />
                </Stack>
            )} */}

            {/* TEAM VIEW */}
            {menuView === "team" && (
                <Stack spacing={0}>
                    <MenuHeader
                        title="Change Team"
                        onBack={() => setMenuView("main")}
                    />

                    <Box className="team-grid">
                        <NHLTeamGrid
                            selectedTeam={selectedTeam}
                            onChange={(teamId) => setSelectedTeam(teamId)}
                        />
                    </Box>
                </Stack>
            )}
        </MuiMenu>
    );
};

export default Menu;

const menuBtnStyles = {
    color: "white",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    textTransform: "uppercase",
    "&:hover": {
        background: "rgba(255,255,255,0.15)",
    },
};
