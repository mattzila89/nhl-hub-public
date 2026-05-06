import MultiViewTheater from "./MultiViewTheater";
import SingleTheaterView from "./SingleTheaterView";
import TheaterControls from "./TheaterControls";

type TheaterViewProps = {
    theaterCards: number[];
    isMultiViewTheater: boolean;
    onExitTheaterMode: () => void;
};

const TheaterView = ({
    theaterCards,
    isMultiViewTheater,
    onExitTheaterMode,
}: TheaterViewProps) => {
    const primaryCard = theaterCards[0];

    if (!primaryCard) {
        return null;
    }

    return (
        <>
            <TheaterControls onExitTheaterMode={onExitTheaterMode} />

            {isMultiViewTheater ? (
                <MultiViewTheater theaterCards={theaterCards} />
            ) : (
                <SingleTheaterView primaryCard={primaryCard} />
            )}
        </>
    );
};

export default TheaterView;
