import { alpha } from "@mui/material/styles";

export const actionButtonSx = {
    width: 26,
    height: 26,
    color: alpha("#ffffff", 0.76),
    backgroundColor: alpha("#111111", 0.1),
    backdropFilter: "blur(6px)",
    "&:hover": {
        color: "#ffffff",
        backgroundColor: alpha("#ffffff", 0.14),
    },
};
