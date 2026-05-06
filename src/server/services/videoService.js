import {
    STREAM_PROBE_FAILURE_MARKERS,
    STREAM_PROBE_MAX_CHARACTERS,
    STREAM_PROBE_SUCCESS_MARKERS,
    STREAM_PROBE_TIMEOUT_MS,
} from "../config.js";
import { supabase } from "../lib/supabase.js";

export const getLatestVideoByGameId = async (gameId) => {
    const { data, error } = await supabase
        .from("streams")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        const streamLookupError = new Error("Failed to lookup game stream");
        streamLookupError.status = 500;
        throw streamLookupError;
    }

    return data ?? null;
};

export const upsertGameStream = async ({ gameId, videoUrl, existingVideo }) => {
    const currentVideo =
        existingVideo === undefined
            ? await getLatestVideoByGameId(gameId)
            : existingVideo;

    if (currentVideo) {
        const { data: updatedStream, error: updateError } = await supabase
            .from("streams")
            .update({ video_url: videoUrl })
            .eq("id", currentVideo.id)
            .select("*")
            .single();

        if (updateError || !updatedStream) {
            const streamUpdateError = new Error("Failed to update stream");
            streamUpdateError.status = 500;
            throw streamUpdateError;
        }

        return {
            action: "updated",
            stream: updatedStream,
            previousStream: currentVideo,
        };
    }

    const { data: createdStream, error: insertError } = await supabase
        .from("streams")
        .insert({
            game_id: gameId,
            video_url: videoUrl,
        })
        .select("*")
        .single();

    if (insertError || !createdStream) {
        const streamCreateError = new Error("Failed to create stream");
        streamCreateError.status = 500;
        throw streamCreateError;
    }

    return {
        action: "created",
        stream: createdStream,
        previousStream: null,
    };
};

export const probeStreamUrl = async (videoUrl) => {
    let parsedUrl;

    try {
        parsedUrl = new URL(videoUrl);
    } catch {
        return {
            ok: false,
            reason: "Invalid URL format",
        };
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return {
            ok: false,
            reason: "URL must use http or https",
        };
    }

    try {
        const response = await fetch(parsedUrl.toString(), {
            redirect: "follow",
            signal: AbortSignal.timeout(STREAM_PROBE_TIMEOUT_MS),
            headers: {
                Accept: "text/html,application/xhtml+xml,*/*",
                "User-Agent": "Mozilla/5.0 NHLHub/1.0",
            },
        });

        if (!response.ok) {
            return {
                ok: false,
                reason: `URL responded with HTTP ${response.status}`,
            };
        }

        const contentType = String(
            response.headers.get("content-type") || "",
        ).toLowerCase();

        if (
            contentType.startsWith("video/") ||
            contentType.includes("application/vnd.apple.mpegurl")
        ) {
            return {
                ok: true,
                contentType,
                finalUrl: response.url || parsedUrl.toString(),
            };
        }

        const responseText = (await response.text().catch(() => "")).slice(
            0,
            STREAM_PROBE_MAX_CHARACTERS,
        );
        const normalizedBody = responseText.toLowerCase();
        if (!normalizedBody) {
            return {
                ok: false,
                reason: "Video page returned an empty response",
            };
        }

        if (
            STREAM_PROBE_FAILURE_MARKERS.some((marker) => {
                return normalizedBody.includes(marker);
            })
        ) {
            return {
                ok: false,
                reason: "Video page reported the channel was unavailable",
            };
        }

        const hasPlayableMarker = STREAM_PROBE_SUCCESS_MARKERS.some(
            (marker) => {
                return normalizedBody.includes(marker);
            },
        );

        if (!hasPlayableMarker) {
            return {
                ok: false,
                reason: "Video page did not look like a playable live embed",
            };
        }

        return {
            ok: true,
            contentType,
            finalUrl: response.url || parsedUrl.toString(),
        };
    } catch (error) {
        return {
            ok: false,
            reason:
                error?.name === "TimeoutError" || error?.name === "AbortError"
                    ? `Timed out after ${STREAM_PROBE_TIMEOUT_MS}ms`
                    : error instanceof Error && error.message
                      ? error.message
                      : "Unexpected network error",
        };
    }
};

export const ensureStreamUrlIsWorking = async (videoUrl) => {
    const probeResult = await probeStreamUrl(videoUrl);

    if (!probeResult.ok) {
        const probeError = new Error(
            `Youtube highlight URL validation failed: ${probeResult.reason}`,
        );
        probeError.status = 400;
        throw probeError;
    }

    return probeResult;
};
