import {
    EASTERN_TIME_ZONE,
    OVERNIGHT_CARRYOVER_END_HOUR,
} from "../config.js";

export { OVERNIGHT_CARRYOVER_END_HOUR };

export const formatEasternDate = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: EASTERN_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
};

export const getEasternHour = (date) => {
    return Number(
        new Intl.DateTimeFormat("en-US", {
            timeZone: EASTERN_TIME_ZONE,
            hour: "2-digit",
            hour12: false,
        }).format(date),
    );
};

export const getPreviousEasternDate = (date) => {
    const previousDate = new Date(date);
    previousDate.setDate(previousDate.getDate() - 1);

    return formatEasternDate(previousDate);
};

export const getEasternDateFromStartTime = (startTimeUTC) => {
    const startTime = new Date(startTimeUTC);

    if (!Number.isFinite(startTime.getTime())) {
        return "";
    }

    return formatEasternDate(startTime);
};
