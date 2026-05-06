import {
    CHAT_READ_RECEIPTS_TABLE,
} from "../config.js";
import {
    sanitizeChatMessageCursor,
    sanitizeChatRoomKey,
} from "../lib/chat.js";
import { supabase } from "../lib/supabase.js";
import { withSignedChatMediaUrl } from "./chatMediaService.js";

export { sanitizeChatMessageCursor, sanitizeChatRoomKey };

export const getChatUserPreview = (user) => {
    return {
        id: user.id,
        name: user.name,
        avatar_url: user.avatar_url,
        selected_team: user.selected_team,
    };
};

export const isChatReadReceiptsUnavailableError = (error) => {
    if (!error || typeof error !== "object") {
        return false;
    }

    return (
        error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.code === "PGRST204"
    );
};

export const createHydratedChatReadReceipt = (readReceipt, usersById) => {
    return {
        ...readReceipt,
        user: usersById.get(readReceipt.user_id) ?? null,
    };
};

export const loadChatReadReceiptsForMessages = async (roomKey, messageIds) => {
    if (messageIds.length === 0) {
        return [];
    }

    const { data: readReceipts, error } = await supabase
        .from(CHAT_READ_RECEIPTS_TABLE)
        .select("room_key, user_id, last_read_message_id, last_read_at")
        .eq("room_key", roomKey)
        .in("last_read_message_id", messageIds)
        .order("last_read_at", { ascending: true });

    if (error) {
        if (isChatReadReceiptsUnavailableError(error)) {
            return [];
        }

        throw error;
    }

    return readReceipts ?? [];
};

export const createChatMessagePayload = (message, user) => {
    return {
        ...message,
        user: getChatUserPreview(user),
        reactions: [],
        read_receipts: [],
    };
};

export const hydrateChatMessages = async (messages) => {
    if (messages.length === 0) {
        return [];
    }

    const roomKey = sanitizeChatRoomKey(messages[0]?.room_key);
    const messageIds = messages.map((message) => message.id);
    const userIds = new Set(messages.map((message) => message.user_id));

    const [{ data: reactions, error: reactionsError }, readReceipts] =
        await Promise.all([
            supabase
                .from("chat_message_reactions")
                .select("*")
                .in("message_id", messageIds)
                .order("created_at", { ascending: true }),
            loadChatReadReceiptsForMessages(roomKey, messageIds),
        ]);

    if (reactionsError) {
        throw reactionsError;
    }

    const messageReactions = reactions ?? [];
    const messageReadReceipts = readReceipts ?? [];

    messageReactions.forEach((reaction) => {
        userIds.add(reaction.user_id);
    });

    messageReadReceipts.forEach((readReceipt) => {
        userIds.add(readReceipt.user_id);
    });

    const { data: users, error } = await supabase
        .from("users")
        .select("id, name, avatar_url, selected_team")
        .in("id", [...userIds]);

    if (error) {
        throw error;
    }

    const usersById = new Map((users ?? []).map((user) => [user.id, user]));
    const reactionsByMessageId = new Map();
    const readReceiptsByMessageId = new Map();

    messageReactions.forEach((reaction) => {
        const hydratedReaction = {
            ...reaction,
            user: usersById.get(reaction.user_id) ?? null,
        };
        const existingReactions =
            reactionsByMessageId.get(reaction.message_id) ?? [];

        reactionsByMessageId.set(reaction.message_id, [
            ...existingReactions,
            hydratedReaction,
        ]);
    });

    messageReadReceipts.forEach((readReceipt) => {
        const hydratedReadReceipt = createHydratedChatReadReceipt(
            readReceipt,
            usersById,
        );
        const existingReadReceipts =
            readReceiptsByMessageId.get(readReceipt.last_read_message_id) ?? [];

        readReceiptsByMessageId.set(readReceipt.last_read_message_id, [
            ...existingReadReceipts,
            hydratedReadReceipt,
        ]);
    });

    return Promise.all(
        messages.map(async (message) => {
            const hydratedMessage = {
                ...message,
                user: usersById.get(message.user_id) ?? null,
                reactions: reactionsByMessageId.get(message.id) ?? [],
                read_receipts: readReceiptsByMessageId.get(message.id) ?? [],
            };

            return withSignedChatMediaUrl(hydratedMessage);
        }),
    );
};

export const hydrateChatMessageReactions = async (messageId) => {
    const { data: reactions, error: reactionsError } = await supabase
        .from("chat_message_reactions")
        .select("*")
        .eq("message_id", messageId)
        .order("created_at", { ascending: true });

    if (reactionsError) {
        throw reactionsError;
    }

    const messageReactions = reactions ?? [];

    if (messageReactions.length === 0) {
        return [];
    }

    const userIds = [
        ...new Set(messageReactions.map((reaction) => reaction.user_id)),
    ];
    const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, name, avatar_url, selected_team")
        .in("id", userIds);

    if (usersError) {
        throw usersError;
    }

    const usersById = new Map((users ?? []).map((user) => [user.id, user]));

    return messageReactions.map((reaction) => {
        return {
            ...reaction,
            user: usersById.get(reaction.user_id) ?? null,
        };
    });
};

export const getChatReadReceiptForUser = async (roomKey, userId) => {
    const { data: readReceipt, error } = await supabase
        .from(CHAT_READ_RECEIPTS_TABLE)
        .select("room_key, user_id, last_read_message_id, last_read_at")
        .eq("room_key", roomKey)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        if (isChatReadReceiptsUnavailableError(error)) {
            return null;
        }

        throw error;
    }

    return readReceipt ?? null;
};
