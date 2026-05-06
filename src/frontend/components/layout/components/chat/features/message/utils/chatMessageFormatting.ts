const emojiSegmenter =
    typeof Intl !== "undefined" && "Segmenter" in Intl
        ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
        : null;

const EMOJI_GRAPHEME_PATTERN =
    /^(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[#*0-9]|\uFE0F|\u200D|\u20E3)+$/u;
const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s<]+)/i;
const TRAILING_URL_PUNCTUATION_PATTERN = /[),.!?:;]+$/;

export const formatMessageTime = (value: string) => {
    return new Date(value).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
};

export const formatReactionTooltip = (names: string[]) => {
    if (names.length === 0) {
        return "";
    }

    if (names.length === 1) {
        return names[0];
    }

    if (names.length === 2) {
        return `${names[0]} and ${names[1]}`;
    }

    return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
};

export const getVisibleGraphemes = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return [];
    }

    if (emojiSegmenter) {
        return Array.from(emojiSegmenter.segment(trimmedValue), (segment) => {
            return segment.segment;
        }).filter((segment) => segment.trim() !== "");
    }

    return Array.from(trimmedValue).filter((segment) => segment.trim() !== "");
};

export const getEmojiOnlyMessageBody = (value: string | null) => {
    if (typeof value !== "string") {
        return null;
    }

    const segments = getVisibleGraphemes(value);

    if (
        segments.length === 0 ||
        segments.length > 3 ||
        !segments.every((segment) => EMOJI_GRAPHEME_PATTERN.test(segment))
    ) {
        return null;
    }

    return value.trim();
};

export const getErrorMessage = (
    error: unknown,
    fallbackMessage: string,
) => {
    return error instanceof Error ? error.message : fallbackMessage;
};

export const getMessagePreviewUrl = (value: string | null) => {
    if (typeof value !== "string") {
        return null;
    }

    const match = value.match(URL_PATTERN);

    if (!match) {
        return null;
    }

    const trimmedUrl = match[1].replace(TRAILING_URL_PUNCTUATION_PATTERN, "");

    if (!trimmedUrl) {
        return null;
    }

    return trimmedUrl.startsWith("www.") ? `https://${trimmedUrl}` : trimmedUrl;
};

export const getMessageBodyWithoutPreviewUrl = (
    value: string | null,
    previewUrl: string | null,
) => {
    if (typeof value !== "string") {
        return "";
    }

    if (!previewUrl) {
        return value;
    }

    const match = value.match(URL_PATTERN);

    if (!match) {
        return value;
    }

    const nextValue = `${value.slice(0, match.index)}${value.slice(
        (match.index ?? 0) + match[0].length,
    )}`
        .replace(/\s+/g, " ")
        .trim();

    return nextValue;
};
