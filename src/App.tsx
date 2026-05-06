import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthProvider";
import Access from "./frontend/pages/login/Access";
import ProtectedRoute from "./frontend/routes/ProtectedRoute";
import Home from "./frontend/pages/main/pages/Home";
import SelectTeam from "./frontend/pages/select-team/SelectTeam";
import PublicRoute from "./frontend/routes/PublicRoute";
import BackgroundProvider from "./BackgroundProvider";
import AppLayout from "./frontend/components/layout/AppLayout";
import Standings from "./frontend/pages/main/pages/Standings";
import Playoffs from "./frontend/pages/main/pages/Playoffs";
import { createTheme, ThemeProvider } from "@mui/material";
import { useMemo } from "react";
import getDesignTokens from "./getDesignTokens";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();
// export const ThemeModeContext = createContext({
//     toggleThemeMode: (_mode: string) => {},
// });

function App() {
    // Check if user has previous default setting in local storage - or should this be something we store in the DB? 🤔
    // const themeModeSetting = localStorage.getItem("theme-mode");
    // const [themeMode, setThemeMode] = useState<string>(
    //     themeModeSetting ?? "glass",
    // );
    // const toggleMode = useMemo(
    //     () => ({
    //         toggleThemeMode: (mode: string) => {
    //             setThemeMode(mode);
    //         },
    //     }),
    //     [],
    // );
    // const theme = useMemo(() => createTheme(getDesignTokens(themeMode)), [themeMode], ); // Switching themes later
    const theme = useMemo(() => createTheme(getDesignTokens()), []); // Default to 🪩 "Glass" for now
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>
                    {/* <ThemeModeContext.Provider value={toggleMode}> */}
                    <ThemeProvider theme={theme}>
                        <BackgroundProvider>
                            <Routes>
                                {/* 🔐 ACCESS CODE */}
                                <Route
                                    path="*"
                                    element={
                                        <PublicRoute>
                                            <Access />
                                        </PublicRoute>
                                    }
                                />
                                {/* 🏒 SELECT YOUR TEAM */}
                                <Route
                                    element={
                                        <ProtectedRoute>
                                            <Outlet />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route
                                        path="/select-team"
                                        element={<SelectTeam />}
                                    />
                                </Route>

                                {/* 🔥 MAIN APP ROUTES */}
                                <Route
                                    element={
                                        <ProtectedRoute>
                                            <AppLayout />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route path="/home" element={<Home />} />
                                    <Route
                                        path="/standings"
                                        element={<Standings />}
                                    />
                                    <Route
                                        path="/playoffs"
                                        element={<Playoffs />}
                                    />
                                </Route>
                            </Routes>
                        </BackgroundProvider>
                    </ThemeProvider>
                    {/* </ThemeModeContext.Provider> */}
                </BrowserRouter>
            </AuthProvider>
            <ReactQueryDevtools buttonPosition="bottom-left" />
        </QueryClientProvider>
    );
}

export default App;
