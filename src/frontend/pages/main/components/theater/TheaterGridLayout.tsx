import { Box } from "@mui/material";
import TheaterVideoSurface from "./TheaterVideoSurface";

type TheaterGridLayoutProps = {
    theaterCards: number[];
};

const TheaterGridLayout = ({ theaterCards }: TheaterGridLayoutProps) => {
    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                display: "grid",
                gridTemplateColumns:
                    theaterCards.length === 2
                        ? "repeat(2, minmax(0, 1fr))"
                        : "repeat(2, minmax(0, 1fr))",
                gridTemplateRows:
                    theaterCards.length === 2
                        ? "minmax(0, 1fr)"
                        : "repeat(2, minmax(0, 1fr))",
                gap: 2,
            }}
        >
            {theaterCards.map((cardId, index) => (
                <TheaterVideoSurface
                    key={cardId}
                    gameId={cardId}
                    titleVariant="h5"
                    sx={{
                        ...(theaterCards.length === 3 && index === 2
                            ? {
                                  gridColumn: "1 / span 2",
                              }
                            : {}),
                    }}
                />
            ))}
        </Box>
    );
};

export default TheaterGridLayout;
