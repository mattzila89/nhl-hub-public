export const sanitizeChatRoomKey = (value) => {
    return typeof value === "string" && value.trim() !== ""
        ? value.trim()
        : "global";
};

export const sanitizeChatMessageCursor = (value) => {
    const parsedCursor = Number.parseInt(String(value), 10);

    if (!Number.isInteger(parsedCursor) || parsedCursor <= 0) {
        return null;
    }

    return parsedCursor;
};
