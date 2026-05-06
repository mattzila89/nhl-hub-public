import type { ThemeOptions } from "@mui/material";

const getDesignTokens = (): ThemeOptions => ({
    spacing: 6,
    shape: {
        borderRadius: 24,
    },
    components: {
        MuiTextField: {
            defaultProps: {
                variant: "outlined",
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    color: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": {
                        border: "1px solid rgba(255, 255, 255, 0.28)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#fff",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#fff",
                    },
                },
                input: {
                    color: "#fff",
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "rgba(255,255,255,0.72)",
                    "&.Mui-focused": {
                        color: "#fff",
                    },
                },
            },
        },
        MuiFormHelperText: {
            styleOverrides: {
                root: {
                    color: "rgba(255,255,255,0.72)",
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    background: "transparent",
                    backdropFilter: "blur(5px)",
                    border: "solid 1px #ffffff",
                    color: "#fff",
                },
                icon: {
                    color: "#fff !important",
                },
                action: {
                    color: "#fff",
                },
                message: {
                    color: "#fff",
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontFamily: "Inter",
                },
            },
        },
    },
    typography: {
        fontFamily: "ESPNFont-Upright",
        allVariants: {
            color: "#fff",
            letterSpacing: "0.05em",
        },
    },
});

export default getDesignTokens;
