import { Button } from "@mui/material";
import { useState } from "react";
import type { ThemeType } from "../../../../interfaces";
import { useAuth } from "../../../../AuthProvider";

const ThemeSelect = () => {
    const { user } = useAuth();
    const [selectedTheme, setSelectedTheme] = useState<ThemeType>(
        user?.selected_theme || "glass",
    );

    return (
        <>
            <Button
                fullWidth
                onClick={() => setSelectedTheme("glass")}
                sx={themeBtnStyles(selectedTheme === "glass")}
            >
                Glass
            </Button>
            <Button
                fullWidth
                onClick={() => setSelectedTheme("arena")}
                sx={themeBtnStyles(selectedTheme === "arena")}
            >
                Arena
            </Button>
            <Button
                fullWidth
                onClick={() => setSelectedTheme("original6")}
                sx={themeBtnStyles(selectedTheme === "original6")}
            >
                Original 6
            </Button>
        </>
    );
};

export default ThemeSelect;

const themeBtnStyles = (selected: boolean) => ({
    color: "white",
    textTransform: "uppercase",
    padding: "8px",
    border: selected ? "2px solid white" : "1px solid rgba(255,255,255,0.2)",

    background: selected ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
    "&:hover": {
        background: "rgba(255,255,255,0.15)",
    },

    transition: "all 0.2s ease",
});
