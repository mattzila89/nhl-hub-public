import crypto from "crypto";

import {
    CHAT_IMAGE_ALLOWED_MIME_TYPES,
    CHAT_IMAGE_EXTENSION_BY_MIME,
    CHAT_IMAGE_MAX_BYTES,
    CHAT_MEDIA_BUCKET,
    CHAT_MEDIA_SIGNED_URL_TTL_SECONDS,
} from "../config.js";
import { sanitizeChatRoomKey } from "../lib/chat.js";
import { supabase } from "../lib/supabase.js";

let chatMediaBucketReadyPromise = null;

export const isUploadedChatMediaMessage = (message) => {
    return (
        message?.message_type === "image" &&
        message?.media_provider === "upload" &&
        typeof message?.media_id === "string" &&
        message.media_id.trim() !== ""
    );
};

export const createChatMediaSignedUrl = async (path) => {
    const expiresIn = Number.isInteger(CHAT_MEDIA_SIGNED_URL_TTL_SECONDS)
        ? Math.max(60, CHAT_MEDIA_SIGNED_URL_TTL_SECONDS)
        : 24 * 60 * 60;
    const { data, error } = await supabase.storage
        .from(CHAT_MEDIA_BUCKET)
        .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
        throw error ?? new Error("Failed to create chat media signed URL");
    }

    return data.signedUrl;
};

export const withSignedChatMediaUrl = async (message) => {
    if (!isUploadedChatMediaMessage(message)) {
        return message;
    }

    try {
        const signedUrl = await createChatMediaSignedUrl(message.media_id);

        return {
            ...message,
            media_url: signedUrl,
        };
    } catch (error) {
        console.error("Failed to sign chat media URL", {
            mediaId: message.media_id,
            error,
        });

        return {
            ...message,
            media_url: null,
        };
    }
};

export const ensureChatMediaBucket = async () => {
    if (chatMediaBucketReadyPromise) {
        return chatMediaBucketReadyPromise;
    }

    chatMediaBucketReadyPromise = (async () => {
        try {
            const { data: existingBucket, error: existingBucketError } =
                await supabase.storage.getBucket(CHAT_MEDIA_BUCKET);

            if (!existingBucket || existingBucketError) {
                const { error: createBucketError } =
                    await supabase.storage.createBucket(CHAT_MEDIA_BUCKET, {
                        public: false,
                        fileSizeLimit: CHAT_IMAGE_MAX_BYTES,
                        allowedMimeTypes: CHAT_IMAGE_ALLOWED_MIME_TYPES,
                    });

                const createBucketErrorMessage =
                    typeof createBucketError?.message === "string"
                        ? createBucketError.message.toLowerCase()
                        : "";

                if (
                    createBucketError &&
                    !createBucketErrorMessage.includes("already exists")
                ) {
                    throw createBucketError;
                }
            } else if (existingBucket.public) {
                const { error: updateBucketError } =
                    await supabase.storage.updateBucket(CHAT_MEDIA_BUCKET, {
                        public: false,
                        fileSizeLimit: CHAT_IMAGE_MAX_BYTES,
                        allowedMimeTypes: CHAT_IMAGE_ALLOWED_MIME_TYPES,
                    });

                if (updateBucketError) {
                    throw updateBucketError;
                }
            }
        } catch (error) {
            chatMediaBucketReadyPromise = null;
            throw error;
        }
    })();

    return chatMediaBucketReadyPromise;
};

const parseChatImageDataUrl = (value) => {
    if (typeof value !== "string" || value.trim() === "") {
        return null;
    }

    const match = value.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);

    if (!match) {
        return null;
    }

    const mimeType = match[1].toLowerCase();
    const base64Data = match[2];

    if (!CHAT_IMAGE_ALLOWED_MIME_TYPES.includes(mimeType)) {
        return null;
    }

    try {
        const buffer = Buffer.from(base64Data, "base64");

        if (buffer.length === 0 || buffer.length > CHAT_IMAGE_MAX_BYTES) {
            return null;
        }

        return {
            mimeType,
            buffer,
        };
    } catch {
        return null;
    }
};

export const uploadChatImage = async ({ userId, roomKey, dataUrl }) => {
    const parsedImage = parseChatImageDataUrl(dataUrl);

    if (!parsedImage) {
        const error = new Error(
            "Upload a PNG, JPG, WEBP, or GIF image under 6 MB",
        );
        error.status = 400;
        throw error;
    }

    await ensureChatMediaBucket();

    const extension =
        CHAT_IMAGE_EXTENSION_BY_MIME[parsedImage.mimeType] ?? "bin";
    const path = `${sanitizeChatRoomKey(roomKey)}/${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { data, error: uploadError } = await supabase.storage
        .from(CHAT_MEDIA_BUCKET)
        .upload(path, parsedImage.buffer, {
            contentType: parsedImage.mimeType,
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError || !data) {
        const error = new Error("Failed to upload image");
        error.status = 500;
        throw error;
    }

    const mediaUrl = await createChatMediaSignedUrl(data.path);

    return {
        provider: "upload",
        mediaId: data.path,
        mediaUrl,
    };
};

export const removeChatMedia = async (mediaId) => {
    return supabase.storage.from(CHAT_MEDIA_BUCKET).remove([mediaId]);
};
