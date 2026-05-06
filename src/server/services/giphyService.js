import {
    DEFAULT_GIPHY_LIMIT,
    GIPHY_API_BASE_URL,
    GIPHY_CONTENT_RATING,
    GIPHY_DEFAULT_COUNTRY_CODE,
    GIPHY_DEFAULT_LANGUAGE,
    MAX_GIPHY_LIMIT,
    MAX_GIPHY_OFFSET,
} from "../config.js";

export const sanitizeGiphyLimit = (value) => {
    const parsedLimit = Number.parseInt(String(value), 10);

    if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
        return DEFAULT_GIPHY_LIMIT;
    }

    return Math.min(parsedLimit, MAX_GIPHY_LIMIT);
};

export const sanitizeGiphyOffset = (value) => {
    const parsedOffset = Number.parseInt(String(value), 10);

    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
        return 0;
    }

    return Math.min(parsedOffset, MAX_GIPHY_OFFSET);
};

const mapGiphyGif = (gif) => {
    const fixedWidthImage = gif?.images?.fixed_width;
    const fallbackImage =
        gif?.images?.downsized_medium ?? gif?.images?.original;
    const previewUrl =
        fixedWidthImage?.url ??
        fallbackImage?.url ??
        gif?.images?.original?.url;
    const width = Number.parseInt(
        fixedWidthImage?.width ?? fallbackImage?.width ?? "0",
        10,
    );
    const height = Number.parseInt(
        fixedWidthImage?.height ?? fallbackImage?.height ?? "0",
        10,
    );

    if (
        typeof gif?.id !== "string" ||
        typeof previewUrl !== "string" ||
        previewUrl === ""
    ) {
        return null;
    }

    return {
        id: gif.id,
        title: typeof gif?.title === "string" ? gif.title : "",
        url: previewUrl,
        previewUrl,
        width: Number.isFinite(width) ? width : 0,
        height: Number.isFinite(height) ? height : 0,
    };
};

export const fetchGiphyGifs = async ({ query, limit, offset }) => {
    const apiKey = process.env.GIPHY_API_KEY;

    if (!apiKey) {
        const error = new Error("Giphy API key is not configured");
        error.status = 500;
        throw error;
    }

    const endpoint = query ? "search" : "trending";
    const params = new URLSearchParams({
        api_key: apiKey,
        limit: String(limit),
        offset: String(offset),
        rating: GIPHY_CONTENT_RATING,
        country_code: GIPHY_DEFAULT_COUNTRY_CODE,
    });

    if (query) {
        params.set("q", query);
        params.set("lang", GIPHY_DEFAULT_LANGUAGE);
    }

    const response = await fetch(`${GIPHY_API_BASE_URL}/${endpoint}?${params}`);

    if (!response.ok) {
        const error = new Error("Failed to load GIFs from Giphy");
        error.status = 502;
        throw error;
    }

    const payload = await response.json();

    const gifs = Array.isArray(payload?.data)
        ? payload.data.map(mapGiphyGif).filter((gif) => gif !== null)
        : [];
    const rawCount = Number.parseInt(
        String(payload?.pagination?.count ?? gifs.length),
        10,
    );
    const rawOffset = Number.parseInt(
        String(payload?.pagination?.offset ?? offset),
        10,
    );
    const rawTotalCount = Number.parseInt(
        String(payload?.pagination?.total_count ?? gifs.length),
        10,
    );
    const count =
        Number.isInteger(rawCount) && rawCount >= 0 ? rawCount : gifs.length;
    const currentOffset =
        Number.isInteger(rawOffset) && rawOffset >= 0 ? rawOffset : offset;
    const totalCount =
        Number.isInteger(rawTotalCount) && rawTotalCount >= 0
            ? rawTotalCount
            : gifs.length;
    const hasMore = currentOffset + count < totalCount;

    return {
        gifs,
        count,
        offset: currentOffset,
        totalCount,
        hasMore,
        nextOffset: hasMore ? currentOffset + count : null,
    };
};
