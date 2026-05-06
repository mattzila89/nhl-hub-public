import { Box, Fade } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import type { MainLayoutContext } from "../../../components/layout/AppLayout";
import TheaterView from "../components/theater/TheaterView";
import { useHomeTheaterState } from "../utils/useHomeTheaterState";
import PlayoffGamesGrid from "../components/games/Playoffs/PlayoffGamesGrid";

const Home = () => {
    const { chatOpen, setChatOpen, theaterMode, setTheaterMode } =
        useOutletContext<MainLayoutContext>();
    const {
        theaterCards,
        hasReachedSelectionLimit,
        multiViewSelection,
        enterSingleView,
        exitTheaterMode,
        isMultiViewTheater,
    } = useHomeTheaterState({
        chatOpen,
        setChatOpen,
        theaterMode,
        setTheaterMode,
    });

    return (
        <Box
            sx={{
                height: "100%",
                minHeight: 0,
                position: "relative",
                overflow: "hidden",
            }}
            data-test="home"
        >
            <Fade in={!theaterMode} timeout={260} unmountOnExit>
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        overflow: "hidden",
                    }}
                >
                    {/* <GamesGrid
                        chatOpen={chatOpen}
                        multiViewSelection={multiViewSelection}
                        minimumSelectionsRemaining={minimumSelectionsRemaining}
                        isMultiViewSelecting={isMultiViewSelecting}
                        canOpenMultiView={canOpenMultiView}
                        hasReachedSelectionLimit={hasReachedSelectionLimit}
                        onOpenMultiView={() => openTheater(multiViewSelection)}
                        onCancelMultiView={cancelMultiView}
                        onOpenGame={enterSingleView}
                        onToggleMultiView={toggleMultiViewSelection}
                    /> */}
                    <PlayoffGamesGrid
                        chatOpen={chatOpen}
                        multiViewSelection={multiViewSelection}
                        hasReachedSelectionLimit={hasReachedSelectionLimit}
                        onOpenGame={enterSingleView}
                    />
                </Box>
            </Fade>

            <Fade in={theaterMode} timeout={260} unmountOnExit>
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        overflow: "hidden",
                        pb: { xs: 0, md: 2 },
                    }}
                >
                    <TheaterView
                        theaterCards={theaterCards}
                        isMultiViewTheater={isMultiViewTheater}
                        onExitTheaterMode={exitTheaterMode}
                    />
                </Box>
            </Fade>
        </Box>
    );
};

export default Home;
