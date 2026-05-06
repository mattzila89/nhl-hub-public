import { isIP } from "node:net";

import {
    LINK_PREVIEW_CACHE_TTL_MS,
    LINK_PREVIEW_TIMEOUT_MS,
} from "../config.js";

const linkPreviewCache = new Map();

const decodeHtmlEntities = (value) => {
    if (typeof value !== "string" || value === "") {
        return "";
    }

    return value.replace(
        /&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|nbsp);/gi,
        (entity, token) => {
            const normalizedToken = String(token).toLowerCase();

            switch (normalizedToken) {
                case "amp":
                    return "&";
                case "lt":
                    return "<";
                case "gt":
                    return ">";
                case "quot":
                    return '"';
                case "apos":
                    return "'";
                case "nbsp":
                    return " ";
                default: {
                    if (normalizedToken.startsWith("#x")) {
                        return String.fromCodePoint(
                            Number.parseInt(normalizedToken.slice(2), 16),
                        );
                    }

                    if (normalizedToken.startsWith("#")) {
                        return String.fromCodePoint(
                            Number.parseInt(normalizedToken.slice(1), 10),
                        );
                    }

                    return entity;
                }
            }
        },
    );
};

const normalizePreviewText = (value, maxLength) => {
    const normalizedValue = decodeHtmlEntities(String(value ?? ""))
        .replace(/\s+/g, " ")
        .trim();

    if (normalizedValue.length <= maxLength) {
        return normalizedValue;
    }

    return `${normalizedValue.slice(0, maxLength - 1).trimEnd()}…`;
};

const escapeRegExp = (value) => {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const extractMetaTagContent = (html, attribute, value, maxLength = 280) => {
    const escapedValue = escapeRegExp(value);
    const patterns = [
        {
            pattern: new RegExp(
                `<meta\\b[^>]*${attribute}\\s*=\\s*(['"])${escapedValue}\\1[^>]*content\\s*=\\s*(['"])([\\s\\S]*?)\\2[^>]*>`,
                "i",
            ),
            contentIndex: 3,
        },
        {
            pattern: new RegExp(
                `<meta\\b[^>]*content\\s*=\\s*(['"])([\\s\\S]*?)\\1[^>]*${attribute}\\s*=\\s*(['"])${escapedValue}\\3[^>]*>`,
                "i",
            ),
            contentIndex: 2,
        },
    ];

    for (const { pattern, contentIndex } of patterns) {
        const match = html.match(pattern);

        if (match) {
            return normalizePreviewText(match[contentIndex], maxLength);
        }
    }

    return "";
};

const extractTitleTagContent = (html) => {
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

    if (!match) {
        return "";
    }

    return normalizePreviewText(match[1], 140);
};

const normalizePreviewAssetUrl = (value, baseUrl) => {
    if (typeof value !== "string" || value.trim() === "") {
        return null;
    }

    try {
        return new URL(value.trim(), baseUrl).toString();
    } catch {
        return null;
    }
};

const isPrivateIpv4 = (hostname) => {
    const parts = hostname.split(".").map((part) => Number.parseInt(part, 10));

    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
        return false;
    }

    if (parts[0] === 10 || parts[0] === 127) {
        return true;
    }

    if (parts[0] === 192 && parts[1] === 168) {
        return true;
    }

    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
        return true;
    }

    if (parts[0] === 169 && parts[1] === 254) {
        return true;
    }

    return false;
};

const isBlockedLinkPreviewHostname = (hostname) => {
    const normalizedHostname = String(hostname ?? "").trim().toLowerCase();

    if (!normalizedHostname) {
        return true;
    }

    if (
        normalizedHostname === "localhost" ||
        normalizedHostname.endsWith(".local")
    ) {
        return true;
    }

    const ipVersion = isIP(normalizedHostname);

    if (ipVersion === 4) {
        return isPrivateIpv4(normalizedHostname);
    }

    if (ipVersion === 6) {
        return normalizedHostname === "::1" || normalizedHostname.startsWith("fe80:");
    }

    return false;
};

const getCachedLinkPreview = (url) => {
    const entry = linkPreviewCache.get(url);

    if (!entry) {
        return null;
    }

    if (entry.expiresAt <= Date.now()) {
        linkPreviewCache.delete(url);
        return null;
    }

    return entry.data;
};

const setCachedLinkPreview = (url, data) => {
    linkPreviewCache.set(url, {
        data,
        expiresAt: Date.now() + LINK_PREVIEW_CACHE_TTL_MS,
    });
};

export const fetchLinkPreview = async (value) => {
    const normalizedValue = String(value ?? "").trim();
    const normalizedUrl =
        normalizedValue.startsWith("www.") && !normalizedValue.startsWith("http")
            ? `https://${normalizedValue}`
            : normalizedValue;
    let parsedUrl;

    try {
        parsedUrl = new URL(normalizedUrl);
    } catch {
        const error = new Error("Invalid URL for preview");
        error.status = 400;
        throw error;
    }

    if (
        (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") ||
        isBlockedLinkPreviewHostname(parsedUrl.hostname)
    ) {
        const error = new Error("Invalid URL for preview");
        error.status = 400;
        throw error;
    }

    const cachedPreview = getCachedLinkPreview(parsedUrl.toString());

    if (cachedPreview) {
        return cachedPreview;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, LINK_PREVIEW_TIMEOUT_MS);

    try {
        const response = await fetch(parsedUrl.toString(), {
            headers: {
                Accept: "text/html,application/xhtml+xml",
                "User-Agent": "Mozilla/5.0 NHLHub/1.0",
            },
            redirect: "follow",
            signal: controller.signal,
        });

        if (!response.ok) {
            const error = new Error("Failed to fetch link preview");
            error.status = response.status;
            throw error;
        }

        const finalUrl = response.url || parsedUrl.toString();
        const finalParsedUrl = new URL(finalUrl);

        if (isBlockedLinkPreviewHostname(finalParsedUrl.hostname)) {
            const error = new Error("Invalid URL for preview");
            error.status = 400;
            throw error;
        }

        const contentType = response.headers.get("content-type") ?? "";

        if (contentType.startsWith("image/")) {
            const imagePreview = {
                url: finalUrl,
                hostname: finalParsedUrl.hostname.replace(/^www\./, ""),
                siteName: null,
                title:
                    finalParsedUrl.pathname.split("/").filter(Boolean).at(-1) ??
                    finalParsedUrl.hostname,
                description: null,
                imageUrl: finalUrl,
            };

            setCachedLinkPreview(parsedUrl.toString(), imagePreview);
            return imagePreview;
        }

        if (!contentType.includes("text/html")) {
            const error = new Error("Preview not available for this URL");
            error.status = 404;
            throw error;
        }

        const html = await response.text();
        const siteName =
            extractMetaTagContent(html, "property", "og:site_name") || null;
        const title =
            extractMetaTagContent(html, "property", "og:title") ||
            extractMetaTagContent(html, "name", "twitter:title") ||
            extractTitleTagContent(html) ||
            finalParsedUrl.hostname.replace(/^www\./, "");
        const description =
            extractMetaTagContent(html, "property", "og:description") ||
            extractMetaTagContent(html, "name", "twitter:description") ||
            extractMetaTagContent(html, "name", "description") ||
            null;
        const imageUrl = normalizePreviewAssetUrl(
            extractMetaTagContent(html, "property", "og:image", 2048) ||
                extractMetaTagContent(html, "name", "twitter:image", 2048),
            finalUrl,
        );
        const preview = {
            url: finalUrl,
            hostname: finalParsedUrl.hostname.replace(/^www\./, ""),
            siteName,
            title,
            description,
            imageUrl,
        };

        setCachedLinkPreview(parsedUrl.toString(), preview);

        return preview;
    } catch (error) {
        if (error?.name === "AbortError") {
            const timeoutError = new Error("Link preview request timed out");
            timeoutError.status = 504;
            throw timeoutError;
        }

        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};
