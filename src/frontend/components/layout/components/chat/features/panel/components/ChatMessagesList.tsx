import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type * as React from "react";
import type {
    ChatMessage,
    ChatMessageUser,
    ChatReactionType,
    User,
} from "../../../../../../../../interfaces";

import ChatMessageItem from "../../message/ChatMessageItem";

type ChatMessagesListProps = {
    bottomRef: React.RefObject<HTMLDivElement | null>;
    currentUser?: User | null;
    deletingMessageId?: number | null;
    editingMessageId?: number | null;
    hasMessagesError?: boolean;
    isFetchPreviousPageError?: boolean;
    isFetchingPreviousPage?: boolean;
    isLoading?: boolean;
    knownMentionUsers: ChatMessageUser[];
    messages: ChatMessage[];
    onDeleteMessage: (messageId: number) => Promise<void>;
    onEditMessage: (messageId: number, body: string) => Promise<void>;
    onFetchPreviousPage: () => void;
    onToggleReaction: (
        messageId: number,
        reactionType: ChatReactionType,
    ) => void;
};

const ChatMessagesList = ({
    bottomRef,
    currentUser,
    deletingMessageId = null,
    editingMessageId = null,
    hasMessagesError = false,
    isFetchPreviousPageError = false,
    isFetchingPreviousPage = false,
    isLoading = false,
    knownMentionUsers,
    messages,
    onDeleteMessage,
    onEditMessage,
    onFetchPreviousPage,
    onToggleReaction,
}: ChatMessagesListProps) => {
    if (isLoading) {
        return (
            <Stack
                spacing={1.25}
                sx={{
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <CircularProgress sx={{ color: "#ffffff" }} />
                <Typography color={alpha("#ffffff", 0.76)}>
                    Loading chat...
                </Typography>
            </Stack>
        );
    }

    return (
        <Stack spacing={1.25}>
            {hasMessagesError && messages.length === 0 && (
                <Alert severity="error">Unable to load chat right now.</Alert>
            )}

            {isFetchPreviousPageError && (
                <Alert
                    severity="warning"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={onFetchPreviousPage}
                        >
                            Retry
                        </Button>
                    }
                >
                    Unable to load older messages.
                </Alert>
            )}

            {isFetchingPreviousPage && (
                <Stack
                    direction="row"
                    sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                    spacing={0.8}
                >
                    <CircularProgress size={14} sx={{ color: "#ffffff" }} />
                    <Typography
                        variant="caption"
                        color={alpha("#ffffff", 0.7)}
                    >
                        Loading older messages...
                    </Typography>
                </Stack>
            )}

            {!messages.length && !hasMessagesError && (
                <Stack
                    spacing={1}
                    sx={{
                        minHeight: 200,
                        textAlign: "center",
                        alignItems: "center",
                        justifyContent: "center",
                        color: alpha("#ffffff", 0.78),
                    }}
                >
                    <Typography variant="h6">No messages yet</Typography>
                    <Typography variant="body2">
                        Start the global chat with the first message.
                    </Typography>
                </Stack>
            )}

            {messages.map((message) => (
                <ChatMessageItem
                    key={message.id}
                    message={message}
                    currentUser={currentUser}
                    mentionUsers={knownMentionUsers}
                    editingMessageId={editingMessageId}
                    deletingMessageId={deletingMessageId}
                    onToggleReaction={onToggleReaction}
                    onEditMessage={onEditMessage}
                    onDeleteMessage={onDeleteMessage}
                />
            ))}
            <Box ref={bottomRef} />
        </Stack>
    );
};

export default ChatMessagesList;
