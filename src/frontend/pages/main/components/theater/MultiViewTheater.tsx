import TheaterGridLayout from "./TheaterGridLayout";

type MultiViewTheaterProps = {
    theaterCards: number[];
};

const MultiViewTheater = ({ theaterCards }: MultiViewTheaterProps) => {
    return <TheaterGridLayout theaterCards={theaterCards} />;
};

export default MultiViewTheater;
