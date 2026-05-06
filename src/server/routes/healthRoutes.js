export const registerHealthRoutes = (app) => {
    app.get("/health", (_req, res) => {
        return res.json({ ok: true });
    });
};
