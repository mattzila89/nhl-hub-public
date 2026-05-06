import {
    CHAT_MESSAGE_PAGE_SIZE,
    CHAT_MESSAGE_TYPES,
    CHAT_REACTION_TYPES,
    CHAT_READ_RECEIPTS_TABLE,
} from "../config.js";
import { supabase } from "../lib/supabase.js";
import { getAuthenticatedUser } from "../services/authService.js";
import {
    createChatMessagePayload,
    createHydratedChatReadReceipt,
    getChatReadReceiptForUser,
    getChatUserPreview,
    hydrateChatMessageReactions,
    hydrateChatMessages,
    isChatReadReceiptsUnavailableError,
    sanitizeChatMessageCursor,
    sanitizeChatRoomKey,
} from "../services/chatService.js";
import {
    createChatMediaSignedUrl,
    removeChatMedia,
    uploadChatImage,
} from "../services/chatMediaService.js";
import {
    fetchGiphyGifs,
    sanitizeGiphyLimit,
    sanitizeGiphyOffset,
} from "../services/giphyService.js";
import { fetchLinkPreview } from "../services/linkPreviewService.js";

export const registerChatRoutes = (app, io) => {
    app.get("/chat/messages", async (req, res) => {
        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        const roomKey = sanitizeChatRoomKey(req.query.room);
        const beforeId = sanitizeChatMessageCursor(req.query.beforeId);
        let messagesQuery = supabase
            .from("chat_messages")
            .select("*")
            .eq("room_key", roomKey)
            .order("id", { ascending: false })
            .limit(CHAT_MESSAGE_PAGE_SIZE + 1);

        if (beforeId !== null) {
            messagesQuery = messagesQuery.lt("id", beforeId);
        }

        const { data: messages, error } = await messagesQuery;

        if (error) {
            return res
                .status(500)
                .json({ error: "Failed to fetch chat messages" });
        }

        const messageRows = messages ?? [];
        const hasPreviousPage = messageRows.length > CHAT_MESSAGE_PAGE_SIZE;
        const pagedMessages = hasPreviousPage
            ? messageRows.slice(0, CHAT_MESSAGE_PAGE_SIZE)
            : messageRows;

        try {
            const hydratedMessages = await hydrateChatMessages(
                [...pagedMessages].reverse(),
            );
            const previousCursor =
                hasPreviousPage && hydratedMessages.length > 0
                    ? hydratedMessages[0].id
                    : null;

            return res.json({
                messages: hydratedMessages,
                previousCursor,
                hasPreviousPage,
            });
        } catch {
            return res
                .status(500)
                .json({ error: "Failed to load chat user details" });
        }
    });

    app.get("/chat/users", async (req, res) => {
        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        const { data: users, error } = await supabase
            .from("users")
            .select("id, name, avatar_url, selected_team")
            .order("name", { ascending: true });

        if (error) {
            return res.status(500).json({ error: "Failed to load chat users" });
        }

        const mentionableUsers = (users ?? []).filter((user) => {
            return typeof user.name === "string" && user.name.trim() !== "";
        });

        return res.json(mentionableUsers);
    });

    app.post("/chat/read-receipts", async (req, res) => {
        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        const roomKey = sanitizeChatRoomKey(req.body.roomKey);
        const messageId = Number(req.body.messageId);

        if (!Number.isInteger(messageId) || messageId <= 0) {
            return res.status(400).json({ error: "Invalid message ID" });
        }

        const { data: message, error: messageError } = await supabase
            .from("chat_messages")
            .select("id, room_key")
            .eq("id", messageId)
            .eq("room_key", roomKey)
            .single();

        if (messageError || !message) {
            return res.status(404).json({ error: "Message not found" });
        }

        let existingReadReceipt = null;

        try {
            existingReadReceipt = await getChatReadReceiptForUser(
                roomKey,
                authResult.user.id,
            );
        } catch (error) {
            return res.status(500).json({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load chat read receipt",
            });
        }

        const previousLastReadMessageId =
            existingReadReceipt?.last_read_message_id ?? null;

        if (
            existingReadReceipt &&
            existingReadReceipt.last_read_message_id >= messageId
        ) {
            return res.json({
                roomKey,
                previousLastReadMessageId,
                readReceipt: createHydratedChatReadReceipt(
                    existingReadReceipt,
                    new Map([
                        [
                            authResult.user.id,
                            getChatUserPreview(authResult.user),
                        ],
                    ]),
                ),
            });
        }

        const lastReadAt = new Date().toISOString();
        const { data: updatedReadReceipt, error: updateError } = await supabase
            .from(CHAT_READ_RECEIPTS_TABLE)
            .upsert(
                {
                    room_key: roomKey,
                    user_id: authResult.user.id,
                    last_read_message_id: messageId,
                    last_read_at: lastReadAt,
                },
                {
                    onConflict: "room_key,user_id",
                },
            )
            .select("room_key, user_id, last_read_message_id, last_read_at")
            .single();

        if (updateError) {
            if (isChatReadReceiptsUnavailableError(updateError)) {
                return res.json({
                    roomKey,
                    previousLastReadMessageId,
                    readReceipt: null,
                });
            }

            return res
                .status(500)
                .json({ error: "Failed to update read receipt" });
        }

        const readReceiptUpdate = {
            roomKey,
            previousLastReadMessageId,
            readReceipt: createHydratedChatReadReceipt(
                updatedReadReceipt,
                new Map([[authResult.user.id, getChatUserPreview(authResult.user)]]),
            ),
        };

        io.emit("chat:read:update", readReceiptUpdate);

        return res.json(readReceiptUpdate);
    });

    app.get("/chat/gifs", async (req, res) => {
        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        const query =
            typeof req.query.query === "string" ? req.query.query.trim() : "";
        const limit = sanitizeGiphyLimit(req.query.limit);
        const offset = sanitizeGiphyOffset(req.query.offset);

        try {
            const gifs = await fetchGiphyGifs({
                query,
                limit,
                offset,
            });

            return res.json(gifs);
        } catch (error) {
            return res.status(error.status ?? 500).json({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load GIFs",
            });
        }
    });

    app.get("/chat/link-preview", async (req, res) => {
        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        const url =
            typeof req.query.url === "string" ? req.query.url.trim() : "";

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        try {
            const preview = await fetchLinkPreview(url);
            return res.json(preview);
        } catch (error) {
            return res.status(error?.status ?? 500).json({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load link preview",
            });
        }
    });

    app.post("/chat/uploads/image", async (req, res) => {
        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        const roomKey = sanitizeChatRoomKey(req.body.roomKey);
        const dataUrl =
            typeof req.body.dataUrl === "string" ? req.body.dataUrl : "";

        try {
            const uploadedImage = await uploadChatImage({
                userId: authResult.user.id,
                roomKey,
                dataUrl,
            });

            return res.json(uploadedImage);
        } catch (error) {
            return res.status(error.status ?? 500).json({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to upload chat image",
            });
        }
    });

    app.post("/chat/messages", async (req, res) => {
        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        const roomKey = sanitizeChatRoomKey(req.body.roomKey);
        const messageType =
            typeof req.body.messageType === "string"
                ? req.body.messageType.trim()
                : "text";
        const body =
            typeof req.body.body === "string" ? req.body.body.trim() : null;
        const mediaProvider =
            typeof req.body.mediaProvider === "string"
                ? req.body.mediaProvider.trim()
                : null;
        const mediaId =
            typeof req.body.mediaId === "string"
                ? req.body.mediaId.trim()
                : null;
        const mediaUrl =
            typeof req.body.mediaUrl === "string"
                ? req.body.mediaUrl.trim()
                : null;
        const isUploadedImageMessage =
            messageType === "image" && mediaProvider === "upload";

        if (!CHAT_MESSAGE_TYPES.has(messageType)) {
            return res.status(400).json({ error: "Invalid message type" });
        }

        if (messageType === "text" && !body) {
            return res.status(400).json({ error: "Message body is required" });
        }

        if (isUploadedImageMessage && !mediaId) {
            return res.status(400).json({ error: "Media file is required" });
        }

        if (
            (messageType === "gif" ||
                (messageType === "image" && !isUploadedImageMessage)) &&
            !mediaUrl
        ) {
            return res.status(400).json({ error: "Media URL is required" });
        }

        let signedMediaUrl = mediaUrl;

        if (isUploadedImageMessage) {
            try {
                signedMediaUrl = await createChatMediaSignedUrl(mediaId);
            } catch (error) {
                console.error("Failed to sign uploaded chat image", {
                    userId: authResult.user.id,
                    roomKey,
                    mediaId,
                    error,
                });

                return res
                    .status(500)
                    .json({ error: "Failed to send chat image" });
            }
        }

        const { data: message, error } = await supabase
            .from("chat_messages")
            .insert({
                user_id: authResult.user.id,
                room_key: roomKey,
                message_type: messageType,
                body,
                media_provider: mediaProvider,
                media_id: mediaId,
                // Keep a non-null URL in the row for compatibility with
                // existing schemas; hydration refreshes upload URLs later.
                media_url: isUploadedImageMessage ? signedMediaUrl : mediaUrl,
            })
            .select("*")
            .single();

        if (error || !message) {
            console.error("Failed to send chat message", {
                userId: authResult.user.id,
                roomKey,
                messageType,
                error,
            });

            return res
                .status(500)
                .json({ error: "Failed to send chat message" });
        }

        const chatMessagePayload = createChatMessagePayload(
            message,
            authResult.user,
        );

        if (isUploadedImageMessage) {
            chatMessagePayload.media_url = signedMediaUrl;
        }

        io.emit("chat:message:new", chatMessagePayload);

        return res.json(chatMessagePayload);
    });

    app.patch("/chat/messages/:messageId", async (req, res) => {
        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        const messageId = Number(req.params.messageId);
        const body =
            typeof req.body.body === "string" ? req.body.body.trim() : "";

        if (!Number.isInteger(messageId) || messageId <= 0) {
            return res.status(400).json({ error: "Invalid message ID" });
        }

        if (!body) {
            return res.status(400).json({ error: "Message body is required" });
        }

        const { data: existingMessage, error: existingMessageError } =
            await supabase
                .from("chat_messages")
                .select("*")
                .eq("id", messageId)
                .single();

        if (existingMessageError || !existingMessage) {
            return res.status(404).json({ error: "Message not found" });
        }

        if (existingMessage.user_id !== authResult.user.id) {
            return res
                .status(403)
                .json({ error: "Not allowed to edit message" });
        }

        if (existingMessage.message_type !== "text") {
            return res
                .status(400)
                .json({ error: "Only text messages can be edited" });
        }

        const { data: updatedMessage, error: updateError } = await supabase
            .from("chat_messages")
            .update({
                body,
            })
            .eq("id", messageId)
            .select("*")
            .single();

        if (updateError || !updatedMessage) {
            return res.status(500).json({ error: "Failed to update message" });
        }

        try {
            const [hydratedMessage] = await hydrateChatMessages([
                updatedMessage,
            ]);

            if (!hydratedMessage) {
                return res
                    .status(500)
                    .json({ error: "Failed to update message" });
            }

            io.emit("chat:message:update", hydratedMessage);

            return res.json(hydratedMessage);
        } catch {
            return res.status(500).json({ error: "Failed to update message" });
        }
    });

    app.delete("/chat/messages/:messageId", async (req, res) => {
        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        const messageId = Number(req.params.messageId);

        if (!Number.isInteger(messageId) || messageId <= 0) {
            return res.status(400).json({ error: "Invalid message ID" });
        }

        const { data: existingMessage, error: existingMessageError } =
            await supabase
                .from("chat_messages")
                .select("id, room_key, user_id, media_provider, media_id")
                .eq("id", messageId)
                .single();

        if (existingMessageError || !existingMessage) {
            return res.status(404).json({ error: "Message not found" });
        }

        if (existingMessage.user_id !== authResult.user.id) {
            return res
                .status(403)
                .json({ error: "Not allowed to delete message" });
        }

        const { error: deleteReactionsError } = await supabase
            .from("chat_message_reactions")
            .delete()
            .eq("message_id", messageId);

        if (deleteReactionsError) {
            return res.status(500).json({ error: "Failed to delete message" });
        }

        const { error: deleteReadReceiptsError } = await supabase
            .from(CHAT_READ_RECEIPTS_TABLE)
            .delete()
            .eq("last_read_message_id", messageId);

        if (
            deleteReadReceiptsError &&
            !isChatReadReceiptsUnavailableError(deleteReadReceiptsError)
        ) {
            return res.status(500).json({ error: "Failed to delete message" });
        }

        const { error: deleteMessageError } = await supabase
            .from("chat_messages")
            .delete()
            .eq("id", messageId);

        if (deleteMessageError) {
            return res.status(500).json({ error: "Failed to delete message" });
        }

        if (
            existingMessage.media_provider === "upload" &&
            typeof existingMessage.media_id === "string" &&
            existingMessage.media_id.trim() !== ""
        ) {
            const { error: removeStorageError } = await removeChatMedia(
                existingMessage.media_id,
            );

            if (removeStorageError) {
                console.error("Failed to remove chat image from storage", {
                    messageId,
                    mediaId: existingMessage.media_id,
                    error: removeStorageError,
                });
            }
        }

        const deleteEvent = {
            messageId,
            roomKey: existingMessage.room_key,
        };

        io.emit("chat:message:delete", deleteEvent);

        return res.json(deleteEvent);
    });

    app.post("/chat/messages/:messageId/reactions", async (req, res) => {
        const authResult = await getAuthenticatedUser(req);

        if ("error" in authResult) {
            return res
                .status(authResult.status)
                .json({ error: authResult.error });
        }

        const messageId = Number(req.params.messageId);
        const reactionType =
            typeof req.body.reactionType === "string"
                ? req.body.reactionType.trim()
                : "";

        if (!Number.isInteger(messageId) || messageId <= 0) {
            return res.status(400).json({ error: "Invalid message ID" });
        }

        if (!CHAT_REACTION_TYPES.has(reactionType)) {
            return res.status(400).json({ error: "Invalid reaction type" });
        }

        const { data: message, error: messageError } = await supabase
            .from("chat_messages")
            .select("id")
            .eq("id", messageId)
            .single();

        if (messageError || !message) {
            return res.status(404).json({ error: "Message not found" });
        }

        const { data: existingReaction, error: existingReactionError } =
            await supabase
                .from("chat_message_reactions")
                .select("*")
                .eq("message_id", messageId)
                .eq("user_id", authResult.user.id)
                .maybeSingle();

        if (existingReactionError) {
            return res
                .status(500)
                .json({ error: "Failed to lookup message reaction" });
        }

        if (existingReaction?.reaction_type === reactionType) {
            const { error: deleteError } = await supabase
                .from("chat_message_reactions")
                .delete()
                .eq("id", existingReaction.id);

            if (deleteError) {
                return res
                    .status(500)
                    .json({ error: "Failed to remove message reaction" });
            }
        } else if (existingReaction) {
            const { error: updateError } = await supabase
                .from("chat_message_reactions")
                .update({
                    reaction_type: reactionType,
                })
                .eq("id", existingReaction.id);

            if (updateError) {
                return res
                    .status(500)
                    .json({ error: "Failed to update message reaction" });
            }
        } else {
            const { error: insertError } = await supabase
                .from("chat_message_reactions")
                .insert({
                    message_id: messageId,
                    user_id: authResult.user.id,
                    reaction_type: reactionType,
                });

            if (insertError) {
                return res
                    .status(500)
                    .json({ error: "Failed to add message reaction" });
            }
        }

        try {
            const reactions = await hydrateChatMessageReactions(messageId);
            const reactionUpdate = {
                messageId,
                reactions,
            };

            io.emit("chat:reaction:update", reactionUpdate);

            return res.json(reactionUpdate);
        } catch {
            return res
                .status(500)
                .json({ error: "Failed to load message reactions" });
        }
    });
};
