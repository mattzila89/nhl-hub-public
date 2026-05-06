import { Stack } from "@mui/material";
import TheaterBottomBar from "./TheaterBottomBar";
import TheaterVideoSurface from "./TheaterVideoSurface";

type SingleTheaterViewProps = {
    primaryCard: number;
};

const SingleTheaterView = ({ primaryCard }: SingleTheaterViewProps) => {
    return (
        <Stack
            sx={{
                width: "100%",
                height: "100%",
                gap: 2,
            }}
        >
            <TheaterVideoSurface
                gameId={primaryCard}
                titleVariant="h4"
                sx={{
                    flex: 1,
                    minHeight: 0,
                }}
            />
            <TheaterBottomBar primaryGameId={primaryCard} />
        </Stack>
    );
};

export default SingleTheaterView;
