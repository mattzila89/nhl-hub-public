import {
    clearLoginAttemptState,
    createSessionToken,
    getAuthenticatedUser,
    getLoginAttemptState,
    getRequestClientKey,
    isValidLoginCode,
    recordFailedLoginAttempt,
} from "../services/authService.js";
import { supabase } from "../lib/supabase.js";

const sendLoginRateLimitResponse = (res, attemptState) => {
    res.set("Retry-After", String(attemptState.retryAfterSeconds));
    return res.status(429).json({
        error: "Too many incorrect access code attempts.",
        code: "LOGIN_RATE_LIMITED",
        triesRemaining: 0,
        blockedUntil: attemptState.blockedUntil,
        retryAfterSeconds: attemptState.retryAfterSeconds,
    });
};

const sendInvalidAccessCodeResponse = (res, attemptState) => {
    return res.status(401).json({
        error: `Invalid access code. ${attemptState.triesRemaining} ${
            attemptState.triesRemaining === 1 ? "try" : "tries"
        } left.`,
        code: "INVALID_ACCESS_CODE",
        triesRemaining: attemptState.triesRemaining,
    });
};

const handleFailedLogin = (res, clientKey) => {
    const attemptState = recordFailedLoginAttempt(clientKey);

    if (attemptState.blockedUntil !== null) {
        return sendLoginRateLimitResponse(res, attemptState);
    }

    return sendInvalidAccessCodeResponse(res, attemptState);
};

export const registerAuthRoutes = (app) => {
    app.post("/login", async (req, res) => {
        const clientKey = getRequestClientKey(req);
        const currentAttemptState = getLoginAttemptState(clientKey);

        if (
            currentAttemptState.blockedUntil !== null &&
            currentAttemptState.blockedUntil > Date.now()
        ) {
            const retryAfterSeconds = Math.max(
                1,
                Math.ceil(
                    (currentAttemptState.blockedUntil - Date.now()) / 1000,
                ),
            );

            res.set("Retry-After", String(retryAfterSeconds));
            return res.status(429).json({
                error: "Too many incorrect access code attempts.",
                code: "LOGIN_RATE_LIMITED",
                triesRemaining: 0,
                blockedUntil: currentAttemptState.blockedUntil,
                retryAfterSeconds,
            });
        }

        const accessCode =
            typeof req.body?.access_code === "string"
                ? req.body.access_code.trim()
                : "";

        if (!isValidLoginCode(accessCode)) {
            return handleFailedLogin(res, clientKey);
        }

        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("access_code", accessCode)
            .single();

        if (userError && userError.code !== "PGRST116") {
            return res.status(500).json({
                error: "Unable to verify the access code right now.",
            });
        }

        if (!user) {
            return handleFailedLogin(res, clientKey);
        }

        const lastLoginAt = new Date().toISOString();
        const { data: updatedUser, error: lastLoginError } = await supabase
            .from("users")
            .update({
                last_login_at: lastLoginAt,
            })
            .eq("id", user.id)
            .select("*")
            .single();

        if (lastLoginError || !updatedUser) {
            console.error("Failed to update user last_login_at", {
                userId: user.id,
                error: lastLoginError,
            });
        }

        const authenticatedUser = updatedUser ?? user;
        const token = createSessionToken();

        const { error: deleteError } = await supabase
            .from("sessions")
            .delete()
            .eq("userId", authenticatedUser.id);

        if (deleteError) {
            return res.status(500).json({ error: "Failed to clear sessions" });
        }

        const { error: insertError } = await supabase.from("sessions").insert({
            userId: authenticatedUser.id,
            token,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        });

        if (insertError) {
            return res.status(500).json({ error: "Failed to create session" });
        }

        clearLoginAttemptState(clientKey);
        return res.json({ token, user: authenticatedUser });
    });

    app.post("/logout", async (req, res) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.replace("Bearer ", "");
        const { error } = await supabase
            .from("sessions")
            .delete()
            .eq("token", token);

        if (error) {
            return res.status(500).json({ error: "Failed to logout" });
        }

        return res.json({ success: true });
    });

    app.get("/me", async (req, res) => {
        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        return res.json(authResult.user);
    });

    app.post("/select-team", async (req, res) => {
        const { team } = req.body;
        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        const { error } = await supabase
            .from("users")
            .update({ selected_team: team })
            .eq("id", authResult.user.id);

        if (error) {
            return res.status(500).json({ error: "Failed to update team" });
        }

        return res.json({ success: true });
    });
};
