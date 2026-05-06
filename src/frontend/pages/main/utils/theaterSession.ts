export type MultiViewLayout = "grid" | "spotlight";

type TheaterSession = {
    theaterCards: number[];
    multiViewLayout: MultiViewLayout;
    chatOpen: boolean;
};

export const THEATER_SESSION_STORAGE_KEY = "nhl-hub:theater-session";
export const THEATER_SESSION_STORAGE_EVENT =
    "nhl-hub:theater-session-change";

const notifyTheaterSessionChange = () => {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(new Event(THEATER_SESSION_STORAGE_EVENT));
};

const isValidTheaterCards = (value: unknown): value is number[] =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 4 &&
    value.every((cardId) => Number.isInteger(cardId) && cardId > 0);

export const readTheaterSession = (): TheaterSession | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const rawSession = window.localStorage.getItem(THEATER_SESSION_STORAGE_KEY);

    if (!rawSession) {
        return null;
    }

    try {
        const parsedSession = JSON.parse(rawSession) as Partial<TheaterSession>;

        if (!isValidTheaterCards(parsedSession.theaterCards)) {
            return null;
        }

        return {
            theaterCards: parsedSession.theaterCards,
            multiViewLayout:
                parsedSession.multiViewLayout === "spotlight"
                    ? "spotlight"
                    : "grid",
            chatOpen:
                typeof parsedSession.chatOpen === "boolean"
                    ? parsedSession.chatOpen
                    : true,
        };
    } catch {
        return null;
    }
};

export const writeTheaterSession = (session: TheaterSession) => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(
        THEATER_SESSION_STORAGE_KEY,
        JSON.stringify(session),
    );
    notifyTheaterSessionChange();
};

export const clearTheaterSession = () => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(THEATER_SESSION_STORAGE_KEY);
    notifyTheaterSessionChange();
};
