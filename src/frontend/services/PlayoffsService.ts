import { useQuery } from "@tanstack/react-query";
import type {
    PlayoffBracketResponse,
    PlayoffRoundGamesResponse,
} from "../pages/main/utils/playoffs.types";
import { buildApiUrl } from "./api";

const getPlayoffsErrorMessage = async (res: Response) => {
    try {
        const data = (await res.json()) as { error?: string };

        if (typeof data.error === "string" && data.error.trim() !== "") {
            return data.error;
        }
    } catch {
        // Ignore JSON parsing failures and use the fallback message below.
    }

    return "Error fetching playoff bracket";
};

const PlayoffsService = {
    useBracket(seasonYear: number) {
        return useQuery<PlayoffBracketResponse>({
            queryKey: ["playoffs", "bracket", seasonYear],
            queryFn: async () => {
                const res = await fetch(
                    buildApiUrl(`/playoffs/bracket/${seasonYear}`),
                );

                if (!res.ok) {
                    throw new Error(await getPlayoffsErrorMessage(res));
                }

                const data: PlayoffBracketResponse = await res.json();
                return data;
            },
            enabled: Number.isInteger(seasonYear) && seasonYear > 1900,
            retry: false,
            refetchInterval: 60_000,
        });
    },
    useRoundGames(seasonYear: number, round: number) {
        return useQuery<PlayoffRoundGamesResponse>({
            queryKey: ["playoffs", "round-games", seasonYear, round],
            queryFn: async () => {
                const res = await fetch(
                    buildApiUrl(`/playoffs/${seasonYear}/round/${round}/games`),
                );

                if (!res.ok) {
                    throw new Error(await getPlayoffsErrorMessage(res));
                }

                const data: PlayoffRoundGamesResponse = await res.json();
                return data;
            },
            enabled:
                Number.isInteger(seasonYear) &&
                seasonYear > 1900 &&
                Number.isInteger(round) &&
                round > 0,
            retry: false,
            refetchInterval: 60_000,
        });
    },
};

export default PlayoffsService;
