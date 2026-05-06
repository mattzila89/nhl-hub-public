import * as React from "react";
import type { Game } from "../../utils/game.types";

const DEFAULT_INTERMISSION_SECONDS = 18 * 60;
const RESYNC_THRESHOLD_SECONDS = 5;

const parseClockToSeconds = (clockValue?: string) => {
    if (!clockValue) {
        return null;
    }

    const segments = clockValue
        .split(":")
        .map((segment) => Number(segment))
        .filter((segment) => Number.isFinite(segment));

    if (segments.length === 2) {
        return segments[0] * 60 + segments[1];
    }

    if (segments.length === 3) {
        return segments[0] * 3600 + segments[1] * 60 + segments[2];
    }

    return null;
};

export const getIntermissionSeed = (game?: Game) => {
    if (!game?.clock?.inIntermission) {
        return null;
    }

    if (game.clock.secondsRemaining > 0) {
        return game.clock.secondsRemaining;
    }

    const parsedClock = parseClockToSeconds(game.clock.timeRemaining);

    if (parsedClock !== null) {
        return parsedClock;
    }

    return DEFAULT_INTERMISSION_SECONDS;
};

export const formatCountdown = (seconds: number) => {
    const safeSeconds = Math.max(seconds, 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const useIntermissionCountdown = (game?: Game) => {
    const seed = React.useMemo(
        () => getIntermissionSeed(game),
        [
            game?.clock?.inIntermission,
            game?.clock?.secondsRemaining,
            game?.clock?.timeRemaining,
        ],
    );
    const isIntermission = Boolean(game?.clock?.inIntermission);
    const [secondsRemaining, setSecondsRemaining] = React.useState<
        number | null
    >(seed);

    React.useEffect(() => {
        if (!isIntermission) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Clear countdown immediately when intermission ends.
            setSecondsRemaining(null);
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect -- Resync countdown from live NHL clock data.
        setSecondsRemaining((currentValue) => {
            if (seed === null) {
                return DEFAULT_INTERMISSION_SECONDS;
            }

            if (
                currentValue === null ||
                Math.abs(seed - currentValue) > RESYNC_THRESHOLD_SECONDS
            ) {
                return seed;
            }

            return currentValue;
        });
    }, [isIntermission, seed]);

    React.useEffect(() => {
        if (!isIntermission || secondsRemaining === null) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setSecondsRemaining((currentValue) => {
                if (currentValue === null) {
                    return currentValue;
                }

                return Math.max(currentValue - 1, 0);
            });
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [isIntermission, secondsRemaining !== null]);

    return secondsRemaining;
};

export default useIntermissionCountdown;
