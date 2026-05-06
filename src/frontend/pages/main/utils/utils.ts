import type { Game } from "./game.types";

export const isGameLive = (game: Game): boolean => {
    return (
        game.gameState === "CRIT" ||
        game.gameState === "LIVE" ||
        game.gameState === "PRE"
    );
};

export const isGameOver = (game: Game): boolean => {
    return game.gameState === "OFF" || game.gameState === "FINAL";
};

export const formatGameTime = (utc: string, includeTime?: boolean) => {
    const date = new Date(utc);
    const now = new Date();
    const formattedTime = date.toLocaleTimeString([], {
        hour: "numeric",
        minute: date.getMinutes() !== 0 ? "2-digit" : undefined,
    });
    const compactFormattedTime = formattedTime.replace(" ", "");

    const isToday = date.toDateString() === now.toDateString();

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
        return includeTime ? compactFormattedTime : formattedTime;
    }

    if (isTomorrow) {
        return `Tomorrow${includeTime && ` (${compactFormattedTime})`}`;
    }

    return `${date.toLocaleDateString([], {
        weekday: "long",
    })}${includeTime && ` (${compactFormattedTime})`}`;
};

export const getPeriodDisplay = (game: Game): string => {
    if (game.clock?.inIntermission) {
        switch (game.periodDescriptor.number) {
            case 1:
                return "1st INT";
            case 2:
                return "2nd INT";
            default:
                return "OT INT";
        }
    }
    switch (game.periodDescriptor.periodType) {
        case "REG": {
            switch (game.periodDescriptor.number) {
                case 1:
                    return "1st";
                case 2:
                    return "2nd";
                case 3:
                    return "3rd";
                default:
                    return "PRE";
            }
        }
        case "OT":
            return "OT";
        case "SO":
            return "SO";
        default:
            return game.periodDescriptor.periodType;
    }
};

export const useAppropriateLogo = (
    team: Game["awayTeam"] | Game["homeTeam"],
): string => {
    return team.name?.default === "Lightning"
        ? team.logo.replace("light", "dark")
        : team.logo;
};
