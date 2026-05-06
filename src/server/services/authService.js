import crypto from "crypto";

import {
    LOGIN_ATTEMPT_RECORD_TTL_MS,
    LOGIN_CODE_PATTERN,
    LOGIN_FAILURE_RESET_MS,
    LOGIN_LOCKOUT_DURATION_MS,
    LOGIN_MAX_FAILED_ATTEMPTS,
} from "../config.js";
import { supabase } from "../lib/supabase.js";

const loginAttemptsByClient = new Map();

const normalizeIpAddress = (value) => {
    if (typeof value !== "string" || value.trim() === "") {
        return "unknown";
    }

    const normalizedValue = value.trim();

    return normalizedValue.startsWith("::ffff:")
        ? normalizedValue.slice(7)
        : normalizedValue;
};

export const getRequestClientKey = (req) => {
    return normalizeIpAddress(req.ip || req.socket?.remoteAddress || "");
};

const cleanupExpiredLoginAttempts = () => {
    const now = Date.now();

    for (const [clientKey, attemptState] of loginAttemptsByClient.entries()) {
        const timeSinceLastFailure = now - attemptState.lastFailureAt;

        if (
            (attemptState.blockedUntil !== null &&
                now >= attemptState.blockedUntil) ||
            (attemptState.blockedUntil === null &&
                timeSinceLastFailure >= LOGIN_FAILURE_RESET_MS) ||
            timeSinceLastFailure >= LOGIN_ATTEMPT_RECORD_TTL_MS
        ) {
            loginAttemptsByClient.delete(clientKey);
        }
    }
};

export const getLoginAttemptState = (clientKey) => {
    cleanupExpiredLoginAttempts();

    return (
        loginAttemptsByClient.get(clientKey) ?? {
            failedAttempts: 0,
            blockedUntil: null,
            lastFailureAt: 0,
        }
    );
};

export const clearLoginAttemptState = (clientKey) => {
    loginAttemptsByClient.delete(clientKey);
};

export const recordFailedLoginAttempt = (clientKey) => {
    const now = Date.now();
    const currentAttemptState = getLoginAttemptState(clientKey);
    const failedAttempts = Math.min(
        currentAttemptState.failedAttempts + 1,
        LOGIN_MAX_FAILED_ATTEMPTS,
    );
    const blockedUntil =
        failedAttempts >= LOGIN_MAX_FAILED_ATTEMPTS
            ? now + LOGIN_LOCKOUT_DURATION_MS
            : null;

    loginAttemptsByClient.set(clientKey, {
        failedAttempts,
        blockedUntil,
        lastFailureAt: now,
    });

    return {
        failedAttempts,
        triesRemaining: Math.max(
            0,
            LOGIN_MAX_FAILED_ATTEMPTS - failedAttempts,
        ),
        blockedUntil,
        retryAfterSeconds:
            blockedUntil === null
                ? null
                : Math.max(1, Math.ceil((blockedUntil - now) / 1000)),
    };
};

export const isValidLoginCode = (accessCode) => {
    return LOGIN_CODE_PATTERN.test(accessCode);
};

export const createSessionToken = () => {
    return crypto.randomUUID();
};

export const getAuthenticatedUserByToken = async (token) => {
    if (!token) {
        return {
            status: 401,
            error: "No auth token",
        };
    }

    const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("token", token)
        .single();

    if (sessionError || !session) {
        return {
            status: 401,
            error: "Invalid session",
        };
    }

    if (new Date(session.expiresAt) < new Date()) {
        return {
            status: 401,
            error: "Session expired",
        };
    }

    const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.userId)
        .single();

    if (userError || !user) {
        return {
            status: 401,
            error: "User not found",
        };
    }

    return {
        user,
    };
};

export const getAuthenticatedUser = async (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return {
            status: 401,
            error: "No auth header",
        };
    }

    const token = authHeader.split(" ")[1];

    return getAuthenticatedUserByToken(token);
};
