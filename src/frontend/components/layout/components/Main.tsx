import type { Dispatch, SetStateAction } from "react";
import { Box, Paper } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import ChatPanel from "./chat/features/panel/ChatPanel";

type MainProps = {
    chatOpen: boolean;
    setChatOpen: Dispatch<SetStateAction<boolean>>;
    setUnreadMessageCount: Dispatch<SetStateAction<number>>;
    theaterMode: boolean;
    setTheaterMode: Dispatch<SetStateAction<boolean>>;
};

const Main = ({
    chatOpen,
    setChatOpen,
    setUnreadMessageCount,
    theaterMode,
    setTheaterMode,
}: MainProps) => {
    return (
        <Box
            component="main"
            sx={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                rowGap: {
                    xs: 0,
                },
                px: theaterMode ? { xs: 0, md: 2 } : { xs: 0, sm: 2 },
                columnGap: { xs: 0, md: chatOpen ? 2 : 0 },
                pt: theaterMode ? { xs: 0, md: 1.5 } : 1,
                overflow: "hidden",
                transition: (theme) =>
                    theme.transitions.create(["row-gap", "column-gap"], {
                        duration: theme.transitions.duration.standard,
                        easing: theme.transitions.easing.easeInOut,
                    }),
            }}
            data-testid="main"
        >
            <Box
                sx={(theme) => ({
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    overflow: "hidden",
                    transition: theme.transitions.create(
                        ["height", "flex-basis"],
                        {
                            duration: theme.transitions.duration.standard,
                            easing: theme.transitions.easing.easeInOut,
                        },
                    ),
                    ...(theaterMode && {
                        height: {
                            xs: chatOpen ? "40%" : "100%",
                            md: "auto",
                        },
                        flex: {
                            xs: "0 0 auto",
                            md: 1,
                        },
                    }),
                })}
            >
                <Outlet
                    context={{
                        chatOpen,
                        setChatOpen,
                        theaterMode,
                        setTheaterMode,
                    }}
                />
            </Box>

            <Box
                sx={(theme) => {
                    if (theaterMode) {
                        return {
                            width: "100%",
                            height: chatOpen ? "60%" : 0,
                            mt: { xs: "auto", md: 0 },
                            flexShrink: 0,
                            overflow: "hidden",
                            opacity: chatOpen ? 1 : 0,
                            transform: chatOpen
                                ? "translate3d(0, 0, 0)"
                                : "translate3d(0, 18px, 0)",
                            pointerEvents: chatOpen ? "auto" : "none",
                            transition: theme.transitions.create(
                                ["width", "height", "opacity", "transform"],
                                {
                                    duration:
                                        theme.transitions.duration.standard,
                                    easing: theme.transitions.easing.easeInOut,
                                },
                            ),
                            [theme.breakpoints.up("md")]: {
                                width: chatOpen ? 340 : 0,
                                height: "100%",
                                transform: chatOpen
                                    ? "translate3d(0, 0, 0)"
                                    : "translate3d(18px, 0, 0)",
                            },
                        };
                    }

                    return {
                        position: "fixed",
                        inset: 0,
                        zIndex: theme.zIndex.modal + 1,
                        width: "100%",
                        height: "100dvh",
                        flexShrink: 0,
                        overflow: "hidden",
                        opacity: chatOpen ? 1 : 0,
                        transform: chatOpen
                            ? "translate3d(0, 0, 0)"
                            : "translate3d(0, 18px, 0)",
                        pointerEvents: chatOpen ? "auto" : "none",
                        transition: theme.transitions.create(
                            ["width", "height", "opacity", "transform"],
                            {
                                duration: theme.transitions.duration.standard,
                                easing: theme.transitions.easing.easeInOut,
                            },
                        ),
                        [theme.breakpoints.up("md")]: {
                            position: "relative",
                            inset: "auto",
                            zIndex: "auto",
                            width: chatOpen ? 340 : 0,
                            borderRadius: 1,
                            height: "100%",
                            transform: chatOpen
                                ? "translate3d(0, 0, 0)"
                                : "translate3d(18px, 0, 0)",
                        },
                    };
                }}
            >
                <Paper
                    component="aside"
                    elevation={0}
                    aria-label="Chat window"
                    sx={(theme) => ({
                        width: "100%",
                        height: theaterMode
                            ? { xs: "100%", md: "calc(100% - 12px)" }
                            : { xs: "100%", lg: "calc(100% - 12px)" },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: theaterMode
                            ? {
                                  xs: 0,
                                  md: 1,
                                  lg: 1,
                              }
                            : {
                                  xs: 0,
                                  lg: 1,
                              },
                        backgroundColor: alpha("#7d7d7d", 0.86),
                        backdropFilter: "blur(16px)",
                        overflow: "hidden",
                        transition: theme.transitions.create(
                            ["transform", "box-shadow", "background-color"],
                            {
                                duration: theme.transitions.duration.shorter,
                            },
                        ),
                    })}
                >
                    <ChatPanel
                        chatOpen={chatOpen}
                        onClose={() => setChatOpen(false)}
                        onUnreadCountChange={setUnreadMessageCount}
                    />
                </Paper>
            </Box>
        </Box>
    );
};

export default Main;
