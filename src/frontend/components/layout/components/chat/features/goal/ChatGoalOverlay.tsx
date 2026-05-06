import * as React from "react";
import { CloseRounded } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ChatGoalSoundButton from "./components/ChatGoalSoundButton";
import {
    isIosLikeDevice,
    loadYouTubeIframeApi,
    type YouTubePlayer,
} from "./utils/youtubeGoalPlayer";

type ChatGoalOverlayProps = {
    overlayKey: number;
    videoCode: string;
    onClose: () => void;
};

const GOAL_VIDEO_VOLUME = 25;
const GOAL_VIDEO_COVER_SCALE = 1;

const ChatGoalOverlay = ({
    overlayKey,
    videoCode,
    onClose,
}: ChatGoalOverlayProps) => {
    const playerContainerRef = React.useRef<HTMLDivElement | null>(null);
    const playerRef = React.useRef<YouTubePlayer | null>(null);
    const isIosAutoplayRestricted = React.useMemo(() => {
        return isIosLikeDevice();
    }, []);
    const [soundPromptState, setSoundPromptState] = React.useState(() => {
        return {
            overlayKey,
            visible: isIosAutoplayRestricted,
        };
    });
    const showTapForSound =
        soundPromptState.overlayKey === overlayKey
            ? soundPromptState.visible
            : isIosAutoplayRestricted;

    const enableOverlayAudio = React.useCallback(() => {
        if (!playerRef.current) {
            return;
        }

        playerRef.current.unMute();
        playerRef.current.setVolume(GOAL_VIDEO_VOLUME);
        playerRef.current.playVideo();
        setSoundPromptState({
            overlayKey,
            visible: false,
        });
    }, [overlayKey]);

    React.useEffect(() => {
        let isCancelled = false;

        const mountPlayer = async () => {
            const container = playerContainerRef.current;

            if (!container) {
                return;
            }

            try {
                const YT = await loadYouTubeIframeApi();

                if (isCancelled || !playerContainerRef.current) {
                    return;
                }

                playerRef.current?.destroy();
                playerContainerRef.current.innerHTML = "";

                playerRef.current = new YT.Player(playerContainerRef.current, {
                    videoId: videoCode,
                    width: "100%",
                    height: "100%",
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        playsinline: 1,
                        mute: isIosAutoplayRestricted ? 1 : 0,
                        modestbranding: 1,
                        rel: 0,
                        iv_load_policy: 3,
                    },
                    events: {
                        onReady: ({ target }) => {
                            if (isIosAutoplayRestricted) {
                                target.mute();
                            } else {
                                target.unMute();
                                target.setVolume(GOAL_VIDEO_VOLUME);
                            }

                            target.playVideo();
                        },
                    },
                });
            } catch (error) {
                console.error("Failed to initialize goal animation player", {
                    videoCode,
                    error,
                });
            }
        };

        void mountPlayer();

        return () => {
            isCancelled = true;
            playerRef.current?.destroy();
            playerRef.current = null;

            if (playerContainerRef.current) {
                playerContainerRef.current.innerHTML = "";
            }
        };
    }, [isIosAutoplayRestricted, overlayKey, videoCode]);

    return (
        <Box
            aria-label="Goal animation overlay"
            sx={{
                position: "absolute",
                inset: 0,
                zIndex: 1600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                pointerEvents: "auto",
                background:
                    "linear-gradient(180deg, rgba(1, 3, 9, 0.24) 0%, rgba(1, 3, 9, 0.82) 30%, rgba(1, 3, 9, 0.92) 100%)",
                backdropFilter: "blur(8px)",
                animation: "chatGoalOverlayFadeIn 220ms ease-out",
                "@keyframes chatGoalOverlayFadeIn": {
                    from: {
                        opacity: 0,
                    },
                    to: {
                        opacity: 1,
                    },
                },
            }}
        >
            <IconButton
                aria-label="Close goal animation"
                onClick={onClose}
                sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 1,
                    color: "#ffffff",
                    backgroundColor: alpha("#04070d", 0.72),
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 16px 32px rgba(0, 0, 0, 0.28)",
                    "&:hover": {
                        backgroundColor: alpha("#04070d", 0.88),
                    },
                }}
            >
                <CloseRounded />
            </IconButton>

            {showTapForSound && (
                <ChatGoalSoundButton onClick={enableOverlayAudio} />
            )}

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                }}
            >
                <Box
                    key={overlayKey}
                    ref={playerContainerRef}
                    aria-hidden="true"
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "auto",
                        height: "100%",
                        minWidth: "100%",
                        aspectRatio: "16 / 9",
                        pointerEvents: "none",
                        transform: `translate(-50%, -50%) scale(${GOAL_VIDEO_COVER_SCALE})`,
                        transformOrigin: "center",
                        "& iframe": {
                            display: "block",
                            width: "100%",
                            height: "100%",
                            border: 0,
                            pointerEvents: "none",
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default ChatGoalOverlay;
