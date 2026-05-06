import { useQuery } from "@tanstack/react-query";
import type { StandingsResponse } from "../pages/main/utils/standings.types";
import { buildApiUrl } from "./api";

const getStandingsErrorMessage = async (res: Response) => {
    try {
        const data = (await res.json()) as { error?: string };

        if (typeof data.error === "string" && data.error.trim() !== "") {
            return data.error;
        }
    } catch {
        // Ignore JSON parsing failures and fall back to a generic message.
    }

    return "Error fetching standings";
};

const StandingsService = {
    useStandings() {
        return useQuery<StandingsResponse>({
            queryKey: ["standings", "now"],
            queryFn: async () => {
                const res = await fetch(buildApiUrl("/standings/now"));

                if (!res.ok) {
                    throw new Error(await getStandingsErrorMessage(res));
                }

                const data: StandingsResponse = await res.json();
                return data;
            },
            retry: false,
            refetchInterval: 60_000,
        });
    },
};

export default StandingsService;
