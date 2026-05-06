import * as React from "react";
import {
    clearTheaterSession,
    readTheaterSession,
    writeTheaterSession,
    type MultiViewLayout,
} from "./theaterSession";

type UseHomeTheaterStateOptions = {
    chatOpen: boolean;
    setChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    theaterMode: boolean;
    setTheaterMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const getSavedTheaterSession = () => readTheaterSession();

const shouldCloseChatOnTheaterExit = () => {
    if (typeof window === "undefined") {
        return false;
    }

    return !window.matchMedia("(min-width:900px)").matches;
};

export const useHomeTheaterState = ({
    chatOpen,
    setChatOpen,
    theaterMode,
    setTheaterMode,
}: UseHomeTheaterStateOptions) => {
    const [multiViewLayout, setMultiViewLayout] =
        React.useState<MultiViewLayout>(
            () => getSavedTheaterSession()?.multiViewLayout ?? "grid",
        );
    const [multiViewSelection, setMultiViewSelection] = React.useState<
        number[]
    >([]);
    const [theaterCards, setTheaterCards] = React.useState<number[]>(
        () => getSavedTheaterSession()?.theaterCards ?? [],
    );

    React.useEffect(() => {
        return () => {
            setTheaterMode(false);
        };
    }, [setTheaterMode]);

    React.useEffect(() => {
        const persistedSession = getSavedTheaterSession();

        if (!persistedSession) {
            return;
        }

        setChatOpen(persistedSession.chatOpen);
        setTheaterMode(true);
    }, [setChatOpen, setTheaterMode]);

    React.useEffect(() => {
        if (!theaterMode || theaterCards.length === 0) {
            clearTheaterSession();
            return;
        }

        writeTheaterSession({
            theaterCards,
            multiViewLayout,
            chatOpen,
        });
    }, [chatOpen, multiViewLayout, theaterCards, theaterMode]);

    const openTheater = (cardIds: number[]) => {
        setTheaterCards(cardIds);
        setMultiViewSelection([]);
        setMultiViewLayout("grid");
        setChatOpen(true);
        setTheaterMode(true);
    };

    const toggleMultiViewSelection = (cardId: number) => {
        setMultiViewSelection((current) => {
            if (current.includes(cardId)) {
                return current.filter(
                    (currentCardId) => currentCardId !== cardId,
                );
            }

            if (current.length >= 4) {
                return current;
            }

            return [...current, cardId];
        });
    };

    const enterSingleView = (cardId: number) => {
        if (multiViewSelection.length > 0) {
            toggleMultiViewSelection(cardId);
            return;
        }

        openTheater([cardId]);
    };

    const exitTheaterMode = () => {
        setTheaterCards([]);
        setMultiViewSelection([]);
        if (shouldCloseChatOnTheaterExit()) {
            setChatOpen(false);
        }
        setTheaterMode(false);
    };

    const cancelMultiView = () => {
        setMultiViewSelection([]);
    };

    const toggleMultiViewLayout = () => {
        setMultiViewLayout((current) =>
            current === "grid" ? "spotlight" : "grid",
        );
    };

    const promoteTheaterCard = (cardId: number) => {
        setTheaterCards((current) => {
            if (current[0] === cardId) {
                return current;
            }

            return [
                cardId,
                ...current.filter((currentCardId) => currentCardId !== cardId),
            ];
        });
    };

    const minimumSelectionsRemaining = Math.max(
        2 - multiViewSelection.length,
        0,
    );
    const isMultiViewSelecting = multiViewSelection.length > 0;
    const canOpenMultiView = multiViewSelection.length >= 2;
    const hasReachedSelectionLimit = multiViewSelection.length >= 4;
    const isMultiViewTheater = theaterCards.length >= 2;

    return {
        multiViewLayout,
        multiViewSelection,
        theaterCards,
        openTheater,
        enterSingleView,
        exitTheaterMode,
        toggleMultiViewSelection,
        cancelMultiView,
        toggleMultiViewLayout,
        promoteTheaterCard,
        minimumSelectionsRemaining,
        isMultiViewSelecting,
        canOpenMultiView,
        hasReachedSelectionLimit,
        isMultiViewTheater,
    };
};
