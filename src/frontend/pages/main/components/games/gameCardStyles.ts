import { alpha, type Theme } from "@mui/material/styles";

export const LIVE_RED = "#FF1E34";

const getBaseGameCardStyles = (theme: Theme) => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    p: 1,
    borderRadius: { xs: 0, sm: 1 },
    backdropFilter: "blur(3px)",
    transition: theme.transitions.create(["transform", "box-shadow"], {
        duration: theme.transitions.duration.shorter,
    }),
});

export const getStandardGameCardStyles = ({
    theme,
    // primaryColor,
    secondaryColor,
}: {
    theme: Theme;
    primaryColor?: string;
    secondaryColor?: string;
}) => {
    const borderColor = `solid 1px ${alpha(secondaryColor || "#000", 0.28)}`;

    return {
        ...getBaseGameCardStyles(theme),
        // backgroundColor: alpha(primaryColor || "#000", 0.1),
        backgroundColor: alpha("#000", 0.1),
        border: {
            xs: "unset",
            sm: borderColor,
        },
        borderTop: {
            xs: borderColor,
            sm: "unset",
        },
        borderBottom: {
            xs: borderColor,
            sm: "unset",
        },
    };
};

export const getLiveGameCardStyles = ({
    theme,
    isSelected,
}: {
    theme: Theme;
    isSelected: boolean;
}) => ({
    ...getBaseGameCardStyles(theme),
    position: "relative",
    overflow: "visible",
    isolation: "isolate",
    backgroundColor: alpha("#C70E2D", 0.42),
    border: `solid 2px ${isSelected ? "#fff" : LIVE_RED}`,
    boxShadow: "0px 0px 6px 6px rgba(255, 0, 0, 0.17)",
    fontFamily: "ESPNFont",
});

export const getGameCardLinkButtonStyles = (backgroundColor: string) => ({
    background: backgroundColor,
    color: "#fff",
    fontFamily: "ESPNFont",
});

export const liveOutlinedActionButtonStyles = {
    borderColor: LIVE_RED,
    color: LIVE_RED,
    "&:hover": {
        background: alpha(LIVE_RED, 0.1),
    },
};
