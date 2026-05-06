export type YouTubePlayer = {
    destroy: () => void;
    playVideo: () => void;
    setVolume: (volume: number) => void;
    mute: () => void;
    unMute: () => void;
};

type YouTubeNamespace = {
    Player: new (
        element: HTMLElement,
        options: {
            videoId: string;
            width?: string | number;
            height?: string | number;
            playerVars?: Record<string, string | number>;
            events?: {
                onReady?: (event: { target: YouTubePlayer }) => void;
            };
        },
    ) => YouTubePlayer;
};

declare global {
    interface Window {
        YT?: YouTubeNamespace;
        onYouTubeIframeAPIReady?: (() => void) | null;
    }
}

const YOUTUBE_IFRAME_API_URL = "https://www.youtube.com/iframe_api";

let youtubeIframeApiPromise: Promise<YouTubeNamespace> | null = null;

export const isIosLikeDevice = () => {
    if (typeof navigator === "undefined") {
        return false;
    }

    const platform = navigator.platform ?? "";
    const userAgent = navigator.userAgent ?? "";

    return (
        /iPad|iPhone|iPod/.test(userAgent) ||
        (platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
};

export const loadYouTubeIframeApi = () => {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("YouTube player is unavailable"));
    }

    if (window.YT?.Player) {
        return Promise.resolve(window.YT);
    }

    if (youtubeIframeApiPromise) {
        return youtubeIframeApiPromise;
    }

    youtubeIframeApiPromise = new Promise<YouTubeNamespace>(
        (resolve, reject) => {
            const existingScript = document.querySelector<HTMLScriptElement>(
                `script[src="${YOUTUBE_IFRAME_API_URL}"]`,
            );
            const script = existingScript ?? document.createElement("script");
            const previousReadyHandler = window.onYouTubeIframeAPIReady;

            const handleReady = () => {
                previousReadyHandler?.();

                if (window.YT?.Player) {
                    resolve(window.YT);
                    return;
                }

                reject(new Error("YouTube player failed to initialize"));
            };

            const handleError = () => {
                reject(new Error("Failed to load YouTube player"));
            };

            window.onYouTubeIframeAPIReady = handleReady;

            if (!existingScript) {
                script.src = YOUTUBE_IFRAME_API_URL;
                script.async = true;
                script.onerror = handleError;
                document.head.appendChild(script);
                return;
            }

            existingScript.addEventListener("error", handleError, {
                once: true,
            });
        },
    );

    return youtubeIframeApiPromise;
};
