import {
    useMutation,
    useQueries,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type {
    AllGames,
    Game,
    Games,
    GameStream,
} from "../pages/main/utils/game.types";
import { buildApiUrl } from "./api";

const GameService = {
    useTeamGames({
        teamAbbrev,
        enabled = false,
    }: {
        teamAbbrev: string;
        enabled?: boolean;
    }) {
        return useQuery<Games>({
            queryKey: ["team-games", teamAbbrev],
            queryFn: async () => {
                const res = await fetch(
                    buildApiUrl(`/team-games/${teamAbbrev.toUpperCase()}`),
                );

                if (!res.ok) {
                    throw new Error("Error fetching team schedule");
                }

                const data: Games = await res.json();
                return data;
            },
            enabled,
            retry: false,
            refetchInterval: 60_000,
        });
    },
    useAllGames() {
        return useQuery<AllGames>({
            queryKey: ["all-games"],
            queryFn: async () => {
                const res = await fetch(buildApiUrl("/all-games/today"));

                if (!res.ok) {
                    throw new Error("Error fetching all games schedule");
                }

                const data: AllGames = await res.json();
                return data;
            },
            retry: false,
            refetchInterval: 60_000,
        });
    },
    useLiveGame(id: number, options?: { enabled?: boolean }) {
        return useQuery<Game>({
            queryKey: ["live-game", id],
            queryFn: async () => {
                const res = await fetch(buildApiUrl(`/live-game/${id}`));

                if (!res.ok) {
                    throw new Error("Error fetching live game");
                }

                const data: Game = await res.json();
                return data;
            },
            enabled:
                Number.isInteger(id) &&
                id > 0 &&
                (options?.enabled ?? true),
            retry: false,
            refetchInterval: 15000,
        });
    },
    useLiveGames(gameIds: number[]) {
        return useQueries({
            queries: gameIds.map((id) => ({
                queryKey: ["live-game", id],
                queryFn: async () => {
                    const res = await fetch(buildApiUrl(`/live-game/${id}`));

                    if (!res.ok) {
                        throw new Error("Error fetching live game");
                    }

                    const data: Game = await res.json();
                    return data;
                },
                enabled: Number.isInteger(id) && id > 0,
                retry: false,
                refetchInterval: 15000,
            })),
        });
    },
    useStream(gameId: number) {
        return useQuery<GameStream | null>({
            queryKey: ["stream", gameId],
            queryFn: async () => {
                const res = await fetch(buildApiUrl(`/stream/${gameId}`));

                if (!res.ok) {
                    throw new Error("Error fetching stream");
                }

                const data: GameStream | null = await res.json();
                return data;
            },
            enabled: Number.isInteger(gameId) && gameId > 0,
            retry: false,
            refetchOnWindowFocus: false,
        });
    },
    useSaveStream() {
        const queryClient = useQueryClient();

        return useMutation({
            mutationKey: ["save-stream"],
            mutationFn: async ({
                gameId,
                videoUrl,
            }: {
                gameId: number;
                videoUrl: string;
            }) => {
                const token = localStorage.getItem("session_token");

                if (!token) {
                    throw new Error("Not authenticated");
                }

                const res = await fetch(buildApiUrl(`/stream/${gameId}`), {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        videoUrl,
                    }),
                });

                if (!res.ok) {
                    const errorData =
                        (await res.json().catch(() => null)) as
                            | { error?: string }
                            | null;

                    throw new Error(
                        errorData?.error?.trim() || "Error saving stream",
                    );
                }

                const data: GameStream = await res.json();
                return data;
            },
            onSuccess: (_, variables) => {
                void queryClient.invalidateQueries({
                    queryKey: ["stream", variables.gameId],
                });
            },
        });
    },
};

export default GameService;
