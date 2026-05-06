import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { IconButton } from "@mui/material";
import { alpha } from "@mui/material/styles";

type TheaterControlsProps = {
    onExitTheaterMode: () => void;
};

const TheaterControls = ({ onExitTheaterMode }: TheaterControlsProps) => {
    return (
        <>
            <IconButton
                aria-label="Exit theater mode"
                onClick={onExitTheaterMode}
                sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    zIndex: 2,
                    color: "#111111",
                    backgroundColor: alpha("#ffffff", 0.9),
                    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.18)",
                    "&:hover": {
                        backgroundColor: alpha("#ffffff", 1),
                    },
                }}
            >
                <ArrowBackRoundedIcon />
            </IconButton>
        </>
    );
};

export default TheaterControls;
