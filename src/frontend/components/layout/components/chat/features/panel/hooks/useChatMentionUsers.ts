import * as React from "react";
import type {
    ChatMessage,
    ChatMessageUser,
    User,
} from "../../../../../../../../interfaces";

type UseChatMentionUsersInput = {
    chatUsers?: ChatMessageUser[];
    currentUser?: User | null;
    messages: ChatMessage[];
    onlineUsers: ChatMessageUser[];
};

const useChatMentionUsers = ({
    chatUsers = [],
    currentUser,
    messages,
    onlineUsers,
}: UseChatMentionUsersInput) => {
    const knownMentionUsers = React.useMemo<ChatMessageUser[]>(() => {
        const usersById = new Map<number, ChatMessageUser>();
        const addMentionUser = (
            mentionUser: ChatMessageUser | null | undefined,
        ) => {
            if (!mentionUser) {
                return;
            }

            usersById.set(mentionUser.id, mentionUser);
        };

        if (currentUser) {
            addMentionUser({
                id: currentUser.id,
                name: currentUser.name,
                avatar_url: currentUser.avatar_url,
                selected_team: currentUser.selected_team,
            });
        }

        chatUsers.forEach(addMentionUser);
        onlineUsers.forEach(addMentionUser);
        messages.forEach((message) => {
            addMentionUser(message.user);
        });

        return [...usersById.values()];
    }, [chatUsers, messages, onlineUsers, currentUser]);

    const mentionSuggestionUsers = React.useMemo(() => {
        return knownMentionUsers.filter((mentionUser) => {
            return mentionUser.id !== currentUser?.id;
        });
    }, [knownMentionUsers, currentUser?.id]);

    return {
        knownMentionUsers,
        mentionSuggestionUsers,
    };
};

export default useChatMentionUsers;
