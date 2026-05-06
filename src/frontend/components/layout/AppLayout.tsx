import * as React from "react";
import { Box } from "@mui/material";
import { readTheaterSession } from "../../pages/main/utils/theaterSession";
import ChatButton from "./components/ChatButton";
import Main from "./components/Main";
import Navigation from "./components/Navigation";

export type MainLayoutContext = {
    chatOpen: boolean;
    setChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    theaterMode: boolean;
    setTheaterMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const getDefaultChatOpen = () => {
    if (typeof window === "undefined") {
        return true;
    }

    return window.matchMedia("(min-width:900px)").matches;
};

const AppLayout = () => {
    const [theaterMode, setTheaterMode] = React.useState(
        () => readTheaterSession() !== null,
    );
    const [chatOpen, setChatOpen] = React.useState(
        theaterMode ? true : getDefaultChatOpen,
    );
    const [unreadMessageCount, setUnreadMessageCount] = React.useState(0);

    return (
        <Box
            sx={{
                height: { xs: "100dvh", md: "100%" },
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                position: "relative",
                pb: {
                    xs: theaterMode ? 0 : 5,
                    md: 2,
                },
            }}
            data-testid="app-layout"
        >
            <Navigation theaterMode={theaterMode} />

            <Main
                chatOpen={chatOpen}
                setChatOpen={setChatOpen}
                setUnreadMessageCount={setUnreadMessageCount}
                theaterMode={theaterMode}
                setTheaterMode={setTheaterMode}
            />

            <ChatButton
                chatOpen={chatOpen}
                theaterMode={theaterMode}
                newMessageCount={unreadMessageCount}
                onOpenChat={() => setChatOpen(true)}
            />
        </Box>
    );
};

export default AppLayout;
