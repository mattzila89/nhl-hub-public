import * as React from "react";
import { useAuth } from "./AuthProvider";
import LoadingNHLText from "./frontend/components/loading/LoadingNHLText";
import { Box } from "@mui/material";
import {
    THEATER_SESSION_STORAGE_EVENT,
    THEATER_SESSION_STORAGE_KEY,
} from "./frontend/pages/main/utils/theaterSession";

export const DEFAULT_VIDEO_CODE = "T65Nn5CHcP0";
const PLAYOFF_VIDEO_CODE = "G4jTiPy41EA";

const hasTheaterSession = () =>
    typeof window !== "undefined" &&
    window.localStorage.getItem(THEATER_SESSION_STORAGE_KEY) !== null;

const BackgroundProvider = ({ children }: { children: React.ReactNode }) => {
    const { isLoading } = useAuth();
    const [hideBackgroundVideo, setHideBackgroundVideo] =
        React.useState(hasTheaterSession);

    React.useEffect(() => {
        const syncBackgroundVideo = () => {
            setHideBackgroundVideo(hasTheaterSession());
        };

        syncBackgroundVideo();
        window.addEventListener("storage", syncBackgroundVideo);
        window.addEventListener(
            THEATER_SESSION_STORAGE_EVENT,
            syncBackgroundVideo,
        );

        return () => {
            window.removeEventListener("storage", syncBackgroundVideo);
            window.removeEventListener(
                THEATER_SESSION_STORAGE_EVENT,
                syncBackgroundVideo,
            );
        };
    }, []);

    if (isLoading) {
        return <LoadingNHLText />;
    }

    const TEAM_CODE_VIDEO_ID = PLAYOFF_VIDEO_CODE;
    // user?.selected_team?.videoCode || DEFAULT_VIDEO_CODE; // Add this back next season
    const accessCodeVideo = `https://www.youtube.com/embed/${TEAM_CODE_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${TEAM_CODE_VIDEO_ID}&playsinline=1&modestbranding=1&rel=0`;

    return (
        <Box className="page-container">
            {!hideBackgroundVideo && (
                <Box className="background-video main-background">
                    <iframe
                        src={accessCodeVideo}
                        title="Page background video"
                        allow="autoplay; fullscreen; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"
                        tabIndex={-1}
                    />
                </Box>
            )}
            <Box className="page-content-layer">{children}</Box>
        </Box>
    );
};

export default BackgroundProvider;
