import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "./interfaces";
import UserService from "./frontend/services/UserService";

type AuthContextType = {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    isAdmin: boolean;
    setTeam: (user: User) => void;
    login: (token: string, user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredSessionToken = () => {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("session_token");
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [sessionToken, setSessionToken] = useState<string | null>(
        getStoredSessionToken,
    );
    const queryClient = useQueryClient();

    const getMe = UserService.useMe({
        enabled: Boolean(sessionToken),
    });

    const clearSession = useCallback(() => {
        localStorage.removeItem("session_token");
        localStorage.removeItem("user");
        setSessionToken(null);
        queryClient.removeQueries({
            queryKey: ["me"],
        });
    }, [queryClient]);

    const user = sessionToken ? (getMe.data ?? null) : null;
    const isLoading = sessionToken ? getMe.isPending : false;
    const isAuthenticated = Boolean(user) && !getMe.isError;

    useEffect(() => {
        if (sessionToken && getMe.isError) {
            const timeoutId = window.setTimeout(() => {
                clearSession();
            }, 0);

            return () => {
                window.clearTimeout(timeoutId);
            };
        }
    }, [clearSession, getMe.isError, sessionToken]);

    useEffect(() => {
        const syncSessionToken = () => {
            setSessionToken(getStoredSessionToken());
        };

        window.addEventListener("focus", syncSessionToken);
        window.addEventListener("storage", syncSessionToken);

        return () => {
            window.removeEventListener("focus", syncSessionToken);
            window.removeEventListener("storage", syncSessionToken);
        };
    }, []);

    const setTeam = (updatedUser: User) => {
        queryClient.setQueryData(["me"], updatedUser);
    };

    const login = (token: string, user: User) => {
        localStorage.setItem("session_token", token);
        setSessionToken(token);
        queryClient.setQueryData(["me"], user);
    };

    const logout = () => {
        localStorage.clear();
        clearSession();
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                isAdmin: user?.role === "admin",
                login,
                setTeam,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
