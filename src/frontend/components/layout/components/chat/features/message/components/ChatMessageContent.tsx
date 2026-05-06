import { Box, Stack, Typography } from "@mui/material";

import ChatLinkPreview from "./ChatLinkPreview";
import ChatMentionChip from "../../chat-mentions/components/ChatMentionChip";
import ChatMessageInlineEditor from "./ChatMessageInlineEditor";
import type { ChatMentionChip as ChatMentionChipData } from "../../chat-mentions/utils/chatMentions";

type ChatMessageContentProps = {
    editValue: string;
    emojiOnlyMessageBody: string | null;
    emojiOnlyMessageCount: number;
    inlineEditorFontSize: number;
    inlineEditorLineHeight: number;
    isEditing: boolean;
    isImageMessage: boolean;
    isMediaMessage: boolean;
    isMessageActionPending: boolean;
    isMobileViewport: boolean;
    isSirenMessage: boolean;
    mediaUrl: string | null;
    mentionChip: ChatMentionChipData | null;
    messageBodyWithoutPreviewUrl: string;
    messagePreviewUrl: string | null;
    messageTextFontSize: number;
    needsIosInputZoomWorkaround: boolean;
    senderName: string;
    onCancelEditing: () => void;
    onEditValueChange: (value: string) => void;
    onSaveEdit: () => void;
};

const ChatMessageContent = ({
    editValue,
    emojiOnlyMessageBody,
    emojiOnlyMessageCount,
    inlineEditorFontSize,
    inlineEditorLineHeight,
    isEditing,
    isImageMessage,
    isMediaMessage,
    isMessageActionPending,
    isMobileViewport,
    isSirenMessage,
    mediaUrl,
    mentionChip,
    messageBodyWithoutPreviewUrl,
    messagePreviewUrl,
    messageTextFontSize,
    needsIosInputZoomWorkaround,
    senderName,
    onCancelEditing,
    onEditValueChange,
    onSaveEdit,
}: ChatMessageContentProps) => {
    if (isEditing) {
        return (
            <ChatMessageInlineEditor
                editValue={editValue}
                inlineEditorFontSize={inlineEditorFontSize}
                inlineEditorLineHeight={inlineEditorLineHeight}
                isMessageActionPending={isMessageActionPending}
                needsIosInputZoomWorkaround={needsIosInputZoomWorkaround}
                onCancel={onCancelEditing}
                onChange={onEditValueChange}
                onSave={onSaveEdit}
            />
        );
    }

    if (isSirenMessage) {
        return <Box sx={{ fontSize: 32 }}>🚨</Box>;
    }

    if (isMediaMessage) {
        return (
            <Box
                component="img"
                src={mediaUrl ?? ""}
                alt={isImageMessage ? `${senderName} image` : `${senderName} GIF`}
                sx={{
                    borderRadius: "8px",
                    display: "block",
                    width: "100%",
                    maxWidth: 220,
                }}
            />
        );
    }

    if (emojiOnlyMessageBody) {
        return (
            <Box
                sx={{
                    px: 0.25,
                    py: 0.1,
                    fontSize: emojiOnlyMessageCount === 1 ? 38 : 32,
                    lineHeight: 1,
                }}
            >
                {emojiOnlyMessageBody}
            </Box>
        );
    }

    if (!mentionChip && !messageBodyWithoutPreviewUrl && !messagePreviewUrl) {
        return null;
    }

    return (
        <Stack spacing={0.85}>
            {mentionChip && (
                <ChatMentionChip
                    mention={mentionChip}
                    maxLabelWidth={isMobileViewport ? 160 : 130}
                />
            )}

            {messageBodyWithoutPreviewUrl && (
                <Typography
                    variant="body1"
                    sx={{
                        fontFamily: "Inter",
                        fontSize: messageTextFontSize,
                        lineHeight: isMobileViewport ? 1.42 : 1.35,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                    }}
                >
                    {messageBodyWithoutPreviewUrl}
                </Typography>
            )}

            {messagePreviewUrl && <ChatLinkPreview url={messagePreviewUrl} />}
        </Stack>
    );
};

export default ChatMessageContent;
