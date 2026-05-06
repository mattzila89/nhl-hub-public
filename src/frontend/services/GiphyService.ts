import { useInfiniteQuery } from "@tanstack/react-query";
import { buildApiUrl } from "./api";

export type GiphyGif = {
    id: string;
    title: string;
    url: string;
    previewUrl: string;
    width: number;
    height: number;
};

type GiphySearchPage = {
    gifs: GiphyGif[];
    count: number;
    offset: number;
    totalCount: number;
    hasMore: boolean;
    nextOffset: number | null;
};

const DEFAULT_GIPHY_LIMIT = 20;

const getSessionToken = () => {
    const token = localStorage.getItem("session_token");

    if (!token) {
        throw new Error("Not authenticated");
    }

    return token;
};

const GiphyService = {
    useInfiniteSearch({
        query,
        enabled = false,
        limit = DEFAULT_GIPHY_LIMIT,
    }: {
        query: string;
        enabled?: boolean;
        limit?: number;
    }) {
        const normalizedQuery = query.trim();

        return useInfiniteQuery<GiphySearchPage>({
            queryKey: ["giphy-search", normalizedQuery, limit],
            queryFn: async ({ pageParam }) => {
                const token = getSessionToken();
                const offset =
                    typeof pageParam === "number" && pageParam >= 0
                        ? pageParam
                        : 0;
                const params = new URLSearchParams({
                    limit: String(limit),
                    offset: String(offset),
                });

                if (normalizedQuery) {
                    params.set("query", normalizedQuery);
                }

                const res = await fetch(buildApiUrl(`/chat/gifs?${params}`), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    const errorBody = (await res.json().catch(() => null)) as {
                        error?: string;
                    } | null;

                    throw new Error(errorBody?.error ?? "Failed to load GIFs");
                }

                const data: GiphySearchPage = await res.json();
                return data;
            },
            initialPageParam: 0,
            getNextPageParam: (lastPage) => {
                return lastPage.nextOffset ?? undefined;
            },
            enabled,
            retry: false,
            staleTime: 60_000,
        });
    },
};

export default GiphyService;
