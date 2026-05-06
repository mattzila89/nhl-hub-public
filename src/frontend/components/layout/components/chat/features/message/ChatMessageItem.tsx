import * as React from "react";
import {
    Avatar,
    Box,
    IconButton,
    Stack,
    Typography,
    useMediaQuery,
} from "@mui/material";
import {
    MoreHorizRounded,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import type {
    ChatMessage,
    ChatMessageUser,
    ChatReactionType,
    User,
} from "../../../../../../../interfaces";
import { chatReactionOptions } from "./utils/chatReactions";
import ChatMessageContent from "./components/ChatMessageContent";
import ChatMessageMenu from "./components/ChatMessageMenu";
import ChatReactionPicker from "./components/ChatReactionPicker";
import ChatReactionSummary from "./components/ChatReactionSummary";
import ChatReadReceipts from "./components/ChatReadReceipts";
import useNeedsIosInputZoomWorkaround from "../../hooks/useNeedsIosInputZoomWorkaround";
import {
    doesChatTextMentionUser,
    extractChatMentionChip,
    type ChatMentionUser,
} from "../chat-mentions/utils/chatMentions";
import {
    formatMessageTime,
    getEmojiOnlyMessageBody,
    getErrorMessage,
    getMessageBodyWithoutPreviewUrl,
    getMessagePreviewUrl,
    getVisibleGraphemes,
} from "./utils/chatMessageFormatting";
import { actionButtonSx } from "./utils/chatMessageStyles";

type ChatMessageItemProps = {
    message: ChatMessage;
    currentUser?: User | null;
    mentionUsers?: ChatMessageUser[];
    editingMessageId?: number | null;
    deletingMessageId?: number | null;
    onToggleReaction: (
        messageId: number,
        reactionType: ChatReactionType,
    ) => void;
    onEditMessage: (messageId: number, body: string) => Promise<void>;
    onDeleteMessage: (messageId: number) => Promise<void>;
};

const ChatMessageItem = ({
    message,
    currentUser,
    mentionUsers = [],
    editingMessageId = null,
    deletingMessageId = null,
    onToggleReaction,
    onEditMessage,
    onDeleteMessage,
}: ChatMessageItemProps) => {
    const needsIosInputZoomWorkaround = useNeedsIosInputZoomWorkaround();
    const isMobileViewport = useMediaQuery("(max-width: 768px)");
    const [reactionPickerAnchorEl, setReactionPickerAnchorEl] =
        React.useState<HTMLElement | null>(null);
    const [messageMenuAnchorEl, setMessageMenuAnchorEl] =
        React.useState<HTMLElement | null>(null);
    const [isEditing, setIsEditing] = React.useState(false);
    const [editDraft, setEditDraft] = React.useState(() => {
        return {
            messageId: message.id,
            value: message.body ?? "",
        };
    });
    const [messageActionError, setMessageActionError] = React.useState<
        string | null
    >(null);
    const editValue =
        editDraft.messageId === message.id ? editDraft.value : message.body ?? "";
    const setEditValue = React.useCallback(
        (value: string) => {
            setEditDraft({
                messageId: message.id,
                value,
            });
        },
        [message.id],
    );
    const isOwnMessage = message.user_id === currentUser?.id;
    const senderName = message.user?.name ?? `User ${message.user_id}`;
    const currentMentionUser = React.useMemo<ChatMentionUser | null>(() => {
        if (!currentUser) {
            return null;
        }

        return {
            id: currentUser.id,
            name: currentUser.name,
            avatar_url: currentUser.avatar_url,
            selected_team: currentUser.selected_team,
        };
    }, [currentUser]);
    const knownMentionUsers = React.useMemo<ChatMentionUser[]>(() => {
        const usersById = new Map<number, ChatMentionUser>();
        const addMentionUser = (
            mentionUser: ChatMentionUser | null | undefined,
        ) => {
            if (!mentionUser) {
                return;
            }

            usersById.set(mentionUser.id, mentionUser);
        };

        mentionUsers.forEach(addMentionUser);
        addMentionUser(message.user);
        addMentionUser(currentMentionUser);

        return [...usersById.values()];
    }, [currentMentionUser, mentionUsers, message.user]);
    const mediaUrl =
        message.message_type === "gif" || message.message_type === "image"
            ? message.media_url
            : null;
    const isImageMessage =
        message.message_type === "image" && Boolean(mediaUrl);
    const isMediaMessage = Boolean(mediaUrl);
    const isSirenMessage = message.message_type === "siren";
    const emojiOnlyMessageBody =
        message.message_type === "text"
            ? getEmojiOnlyMessageBody(message.body)
            : null;
    const emojiOnlyMessageCount = emojiOnlyMessageBody
        ? getVisibleGraphemes(emojiOnlyMessageBody).length
        : 0;
    const mentionChip =
        message.message_type === "text"
            ? extractChatMentionChip(
                  message.body ?? "",
                  knownMentionUsers,
                  currentMentionUser,
              )
            : null;
    const messageTextForDisplay =
        mentionChip?.remainingText ?? message.body ?? "";
    const messagePreviewUrl =
        message.message_type === "text"
            ? getMessagePreviewUrl(messageTextForDisplay)
            : null;
    const messageBodyWithoutPreviewUrl =
        message.message_type === "text"
            ? getMessageBodyWithoutPreviewUrl(
                  messageTextForDisplay,
                  messagePreviewUrl,
              )
            : (message.body ?? "");
    const isPreviewOnlyMessage =
        !mentionChip &&
        Boolean(messagePreviewUrl) &&
        messageBodyWithoutPreviewUrl === "";
    const shouldUseMediaPadding =
        isEditing ||
        isMediaMessage ||
        isSirenMessage ||
        Boolean(emojiOnlyMessageBody) ||
        isPreviewOnlyMessage;
    const senderTeamColor = isOwnMessage
        ? currentUser?.selected_team?.primaryColor
        : message.user?.selected_team?.primaryColor || "#000";
    const isCurrentUserMentioned =
        !isOwnMessage &&
        message.message_type === "text" &&
        doesChatTextMentionUser(
            message.body,
            knownMentionUsers,
            currentMentionUser,
        );
    const reactions = message.reactions ?? [];
    const currentUserReaction = reactions.find((reaction) => {
        return reaction.user_id === currentUser?.id;
    });
    const reactionCounts = chatReactionOptions
        .map((reactionOption) => {
            const matchingReactions = reactions.filter((reaction) => {
                return reaction.reaction_type === reactionOption.type;
            });

            return {
                ...reactionOption,
                count: matchingReactions.length,
                names: matchingReactions.map((reaction) => {
                    return reaction.user?.name ?? `User ${reaction.user_id}`;
                }),
            };
        })
        .filter((reactionOption) => reactionOption.count > 0);
    const canManageMessage = isOwnMessage;
    const canEditMessage = isOwnMessage && message.message_type === "text";
    const shouldShowReactionControl =
        !isEditing && !isSirenMessage && !emojiOnlyMessageBody && !isOwnMessage;
    const shouldShowMenuControl = canManageMessage && !isEditing;
    const actionControlCount =
        Number(shouldShowReactionControl) + Number(shouldShowMenuControl);
    const reactionBadgeRightOffset = actionControlCount > 1 ? 60 : 33;
    const isEditPending = editingMessageId === message.id;
    const isDeletePending = deletingMessageId === message.id;
    const isMessageActionPending = isEditPending || isDeletePending;
    const messageMenuOpen = Boolean(messageMenuAnchorEl);
    const reactionPickerOpen = Boolean(reactionPickerAnchorEl);
    const inlineEditorFontSize = needsIosInputZoomWorkaround
        ? 16
        : isMobileViewport
          ? 14
          : 12;
    const inlineEditorLineHeight = needsIosInputZoomWorkaround
        ? 1.25
        : isMobileViewport
          ? 1.35
          : 1.4;
    const messageTextFontSize = isMobileViewport ? 15 : 12;
    const messageMetaFontSize = isMobileViewport ? 10 : 9;
    const readReceiptAvatarSize = isMobileViewport ? 18 : 16;
    const actionControlButtonSx = {
        ...actionButtonSx,
        width: isMobileViewport ? 30 : actionButtonSx.width,
        height: isMobileViewport ? 30 : actionButtonSx.height,
    };
    const readReceipts = isOwnMessage
        ? (message.read_receipts ?? []).filter((receipt) => {
              return (
                  receipt.user_id !== currentUser?.id &&
                  receipt.user_id !== message.user_id
              );
          })
        : [];
    const handleCloseMessageMenu = () => {
        setMessageMenuAnchorEl(null);
    };

    const handleCloseReactionPicker = () => {
        setReactionPickerAnchorEl(null);
    };

    const handleOpenMessageMenu = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        handleCloseReactionPicker();
        setMessageActionError(null);
        setMessageMenuAnchorEl(event.currentTarget);
    };

    const handleToggleReactionPicker = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        setMessageMenuAnchorEl(null);
        setReactionPickerAnchorEl((current) => {
            return current ? null : event.currentTarget;
        });
    };

    const handleStartEditing = () => {
        handleCloseMessageMenu();

        if (!canEditMessage) {
            return;
        }

        setMessageActionError(null);
        setEditValue(message.body ?? "");
        setIsEditing(true);
    };

    const handleCancelEditing = () => {
        if (isMessageActionPending) {
            return;
        }

        setMessageActionError(null);
        setEditValue(message.body ?? "");
        setIsEditing(false);
    };

    const handleSaveEdit = async () => {
        const trimmedValue = editValue.trim();

        if (!trimmedValue) {
            setMessageActionError("Message body is required");
            return;
        }

        try {
            setMessageActionError(null);
            await onEditMessage(message.id, trimmedValue);
            setIsEditing(false);
        } catch (error) {
            setMessageActionError(
                getErrorMessage(error, "Failed to update chat message"),
            );
        }
    };

    const handleDeleteMessageClick = async () => {
        handleCloseMessageMenu();
        setMessageActionError(null);

        try {
            await onDeleteMessage(message.id);
        } catch (error) {
            setMessageActionError(
                getErrorMessage(error, "Failed to delete chat message"),
            );
        }
    };

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: "flex-end",
                justifyContent: isOwnMessage ? "flex-end" : "flex-start",
            }}
        >
            {!isOwnMessage && (
                <Avatar
                    src={message.user?.avatar_url ?? undefined}
                    alt={senderName}
                    sx={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                    }}
                />
            )}

            <Stack
                spacing={0.25}
                sx={{
                    alignItems: isOwnMessage ? "flex-end" : "flex-start",
                    maxWidth: isMobileViewport ? "88%" : "82%",
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: messageMetaFontSize,
                        fontFamily: "Inter",
                        px: 0.75,
                        color: alpha("#ffffff", 0.72),
                    }}
                >
                    {isOwnMessage ? "You" : senderName} ·{" "}
                    {formatMessageTime(message.created_at)}
                </Typography>

                <Box
                    sx={{
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        flexDirection: isOwnMessage ? "row-reverse" : "row",
                    }}
                >
                    <Box>
                        <Box
                            sx={{
                                px: isMobileViewport ? 1.75 : 1.5,
                                py: isMobileViewport ? 1.15 : 1,
                                ...(!isEditing &&
                                    message.message_type === "siren" && {
                                        maxHeight: 38,
                                    }),
                                ...(shouldUseMediaPadding && {
                                    p: 0,
                                }),
                                borderRadius: "8px",
                                color: "#ffffff",
                                ...(isCurrentUserMentioned && {
                                    boxShadow: `0 0 0 1px ${alpha("#ffffff", 0.72)}, 0 0 0 4px ${alpha("#ffffff", 0.14)}`,
                                }),
                                ...(!shouldUseMediaPadding && {
                                    background: senderTeamColor,
                                }),
                            }}
                        >
                            <ChatMessageContent
                                editValue={editValue}
                                emojiOnlyMessageBody={emojiOnlyMessageBody}
                                emojiOnlyMessageCount={emojiOnlyMessageCount}
                                inlineEditorFontSize={inlineEditorFontSize}
                                inlineEditorLineHeight={inlineEditorLineHeight}
                                isEditing={isEditing}
                                isImageMessage={isImageMessage}
                                isMediaMessage={isMediaMessage}
                                isMessageActionPending={isMessageActionPending}
                                isMobileViewport={isMobileViewport}
                                isSirenMessage={isSirenMessage}
                                mediaUrl={mediaUrl}
                                mentionChip={mentionChip}
                                messageBodyWithoutPreviewUrl={
                                    messageBodyWithoutPreviewUrl
                                }
                                messagePreviewUrl={messagePreviewUrl}
                                messageTextFontSize={messageTextFontSize}
                                needsIosInputZoomWorkaround={
                                    needsIosInputZoomWorkaround
                                }
                                senderName={senderName}
                                onCancelEditing={handleCancelEditing}
                                onEditValueChange={setEditValue}
                                onSaveEdit={() => {
                                    void handleSaveEdit();
                                }}
                            />
                        </Box>

                        <ChatReactionSummary
                            isMobileViewport={isMobileViewport}
                            isOwnMessage={isOwnMessage}
                            reactionBadgeRightOffset={reactionBadgeRightOffset}
                            reactionCounts={reactionCounts}
                        />
                    </Box>

                    {(shouldShowReactionControl || shouldShowMenuControl) && (
                        <Stack
                            direction="row"
                            spacing={0.4}
                            sx={{ alignItems: "center" }}
                        >
                            {shouldShowMenuControl && (
                                <>
                                    <IconButton
                                        aria-label="Open message actions"
                                        size="small"
                                        disabled={isMessageActionPending}
                                        onClick={handleOpenMessageMenu}
                                        sx={actionControlButtonSx}
                                    >
                                        <MoreHorizRounded
                                            sx={{
                                                fontSize: isMobileViewport
                                                    ? 17
                                                    : 15,
                                            }}
                                        />
                                    </IconButton>

                                    <ChatMessageMenu
                                        anchorEl={messageMenuAnchorEl}
                                        canEditMessage={canEditMessage}
                                        isMessageActionPending={
                                            isMessageActionPending
                                        }
                                        isOwnMessage={isOwnMessage}
                                        open={messageMenuOpen}
                                        onClose={handleCloseMessageMenu}
                                        onDeleteMessage={() => {
                                            void handleDeleteMessageClick();
                                        }}
                                        onStartEditing={handleStartEditing}
                                    />
                                </>
                            )}
                            {shouldShowReactionControl && (
                                <ChatReactionPicker
                                    actionControlButtonSx={
                                        actionControlButtonSx
                                    }
                                    anchorEl={reactionPickerAnchorEl}
                                    currentUserReactionType={
                                        currentUserReaction?.reaction_type
                                    }
                                    isMobileViewport={isMobileViewport}
                                    open={reactionPickerOpen}
                                    onClose={handleCloseReactionPicker}
                                    onToggle={handleToggleReactionPicker}
                                    onSelectReaction={(reactionType) => {
                                        onToggleReaction(
                                            message.id,
                                            reactionType,
                                        );
                                        handleCloseReactionPicker();
                                    }}
                                />
                            )}
                        </Stack>
                    )}
                </Box>

                <ChatReadReceipts
                    isMobileViewport={isMobileViewport}
                    readReceiptAvatarSize={readReceiptAvatarSize}
                    readReceipts={readReceipts}
                />

                {messageActionError && (
                    <Typography
                        variant="caption"
                        sx={{
                            px: 0.75,
                            fontSize: isMobileViewport ? 11 : 10,
                            fontFamily: "Inter",
                            color: "#ff8a80",
                        }}
                    >
                        {messageActionError}
                    </Typography>
                )}
            </Stack>
        </Stack>
    );
};

export default ChatMessageItem;
