import { useState } from "react";
import { useAuth } from "../../../../../AuthProvider";
import {
    Avatar as AvatarMenu,
    ButtonBase,
    Typography,
    IconButton,
} from "@mui/material";
import Menu from "./Menu";

export type MenuView = "main" | "theme" | "team";

const Avatar = ({
    variant = "desktop",
}: {
    variant?: "desktop" | "mobileNav";
}) => {
    const { user } = useAuth();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuView, setMenuView] = useState<MenuView>("main");

    const open = Boolean(anchorEl);
    const avatar = user?.avatar_url;

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setMenuView("main"); // reset view when closing
    };

    const isMobileNav = variant === "mobileNav";

    return (
        <>
            {isMobileNav ? (
                <ButtonBase
                    onClick={handleOpen}
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        py: 1,
                        borderRadius: 2.5,
                        color: open ? "#fff" : "rgba(255,255,255,0.7)",
                    }}
                >
                    <AvatarMenu
                        src={avatar}
                        sx={{
                            width: 24,
                            height: 24,
                            outline: "2px solid rgba(112, 160, 255, 0.95)",
                        }}
                    />

                    <Typography
                        sx={{
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            lineHeight: 1,
                        }}
                    >
                        Profile
                    </Typography>
                </ButtonBase>
            ) : (
                <IconButton onClick={handleOpen}>
                    <AvatarMenu
                        src={avatar}
                        sx={{
                            width: 45,
                            height: 45,
                            boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
                        }}
                    />
                </IconButton>
            )}

            <Menu
                anchorEl={anchorEl}
                menuView={menuView}
                open={open}
                handleClose={handleClose}
                isMobileNav={isMobileNav}
                setMenuView={setMenuView}
            />
        </>
    );
};

export default Avatar;
