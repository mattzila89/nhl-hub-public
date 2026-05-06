import { useMutation, useQuery } from "@tanstack/react-query";
import type { Login, Team, User } from "../../interfaces";
import { buildApiUrl } from "./api";

type ServiceError = Error & {
    status?: number;
    code?: string;
    triesRemaining?: number;
    retryAfterSeconds?: number;
    blockedUntil?: number;
};

const UserService = {
    useMe({ enabled = false }: { enabled?: boolean } = {}) {
        return useQuery<User>({
            queryKey: ["me"],
            queryFn: async () => {
                const token = localStorage.getItem("session_token");

                if (!token) {
                    throw new Error("Not authenticated");
                }

                const res = await fetch(buildApiUrl("/me"), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Not authenticated");
                }

                const data: User = await res.json();
                return data;
            },
            enabled,
            retry: false,
            staleTime: 30_000,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
        });
    },
    useLogin() {
        return useMutation({
            mutationKey: ["login"],
            mutationFn: async (enteredCode: string): Promise<Login> => {
                const res = await fetch(buildApiUrl("/login"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        access_code: enteredCode,
                    }),
                });
                if (!res.ok) {
                    let message = "Login failed";
                    let code: string | undefined;
                    let triesRemaining: number | undefined;
                    let retryAfterSeconds: number | undefined;
                    let blockedUntil: number | undefined;

                    try {
                        const data: unknown = await res.json();

                        if (
                            typeof data === "object" &&
                            data !== null &&
                            "error" in data &&
                            typeof data.error === "string" &&
                            data.error.trim().length > 0
                        ) {
                            message = data.error;
                        }

                        if (
                            typeof data === "object" &&
                            data !== null &&
                            "code" in data &&
                            typeof data.code === "string"
                        ) {
                            code = data.code;
                        }

                        if (
                            typeof data === "object" &&
                            data !== null &&
                            "triesRemaining" in data &&
                            typeof data.triesRemaining === "number"
                        ) {
                            triesRemaining = data.triesRemaining;
                        }

                        if (
                            typeof data === "object" &&
                            data !== null &&
                            "retryAfterSeconds" in data &&
                            typeof data.retryAfterSeconds === "number"
                        ) {
                            retryAfterSeconds = data.retryAfterSeconds;
                        }

                        if (
                            typeof data === "object" &&
                            data !== null &&
                            "blockedUntil" in data &&
                            typeof data.blockedUntil === "number"
                        ) {
                            blockedUntil = data.blockedUntil;
                        }
                    } catch {
                        // Fall back to the default message when no JSON body is returned.
                    }

                    const error = new Error(message) as ServiceError;
                    error.status = res.status;
                    error.code = code;
                    error.triesRemaining = triesRemaining;
                    error.retryAfterSeconds = retryAfterSeconds;
                    error.blockedUntil = blockedUntil;
                    throw error;
                }

                const data: Login = await res.json();
                return data;
            },
        });
    },
    useLogout() {
        return useMutation({
            mutationKey: ["logout"],
            mutationFn: async () => {
                const token = localStorage.getItem("session_token");
                if (!token) return;

                const res = await fetch(buildApiUrl("/logout"), {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Logout failed");
                }
            },
        });
    },
    useSelectTeam() {
        return useMutation({
            mutationKey: ["select-team"],
            mutationFn: async (selectedTeam: Team) => {
                const token = localStorage.getItem("session_token");
                if (!token) return;

                const res = await fetch(buildApiUrl("/select-team"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        team: selectedTeam,
                    }),
                });

                if (!res.ok) {
                    throw new Error("Logout failed");
                }
            },
        });
    },
};

export default UserService;
