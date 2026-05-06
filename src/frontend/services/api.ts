const trimTrailingSlash = (value: string) => {
    return value.replace(/\/+$/, "");
};

const normalizeConfiguredBaseUrl = (value: string | undefined) => {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return null;
    }

    return trimTrailingSlash(trimmedValue);
};

const getConfiguredApiBaseUrl = () => {
    return normalizeConfiguredBaseUrl(import.meta.env.VITE_API_BASE_URL);
};

export const buildApiUrl = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const configuredApiBaseUrl = getConfiguredApiBaseUrl();

    if (!configuredApiBaseUrl) {
        return `/api${normalizedPath}`;
    }

    return `${configuredApiBaseUrl}${normalizedPath}`;
};

export const getSocketServerUrl = () => {
    const configuredSocketUrl = normalizeConfiguredBaseUrl(
        import.meta.env.VITE_SOCKET_URL,
    );

    if (configuredSocketUrl) {
        return configuredSocketUrl;
    }

    return getConfiguredApiBaseUrl() ?? undefined;
};
