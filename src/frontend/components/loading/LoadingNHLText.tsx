import { Box } from "@mui/material";
import "./Loading.css";
import logo from "./assets/NHLHubLogo.png";

const LoadingNHLText = () => {
    return (
        <Box className="loader-container">
            <img src={logo} alt="Loading" className="loader-image" />
        </Box>
    );
};

export default LoadingNHLText;
