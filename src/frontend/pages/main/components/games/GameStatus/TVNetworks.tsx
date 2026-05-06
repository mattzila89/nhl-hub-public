import { Box } from "@mui/material";
import type { Game } from "../../../utils/game.types";
import { BROADCAST_LOGOS } from "./broadcastLogos";

const normalizeNetwork = (network: string) =>
    network.replace(/\s+/g, "").toUpperCase();

const TVNetworks = ({ broadcasts }: { broadcasts: Game["tvBroadcasts"] }) => {
    return (
        <Box
            sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
            }}
        >
            {broadcasts.map((b) => {
                const key = normalizeNetwork(b.network);
                const logo = BROADCAST_LOGOS[key];

                if (!logo) return null; // or fallback

                return (
                    <Box
                        key={b.id}
                        component="img"
                        src={logo}
                        alt={b.network}
                        sx={{
                            maxHeight: 28,
                            maxWidth: 52,
                            height: "auto",
                            width: "100%",
                        }}
                    />
                );
            })}
        </Box>
    );
};

export default TVNetworks;
