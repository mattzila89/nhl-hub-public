import type { ChatMessageUser } from "../../../../../../../../interfaces";

export type ChatMentionUser = Pick<
    ChatMessageUser,
    "id" | "name" | "avatar_url" | "selected_team"
>;

export type ChatMentionSuggestion = {
    user: ChatMentionUser;
    displayName: string;
    handle: string;
};

type ActiveChatMention = {
    start: number;
    end: number;
    query: string;
};

export type ChatMentionChip = {
    value: string;
    user: ChatMentionUser;
    displayName: string;
    isCurrentUser: boolean;
    remainingText: string;
};

const MENTION_HANDLE_PATTERN = /^[A-Za-z0-9_-]{0,32}$/;
const MENTION_TEXT_PATTERN = /(^|[^A-Za-z0-9_@-])@([A-Za-z0-9_-]{1,32})/g;

const normalizeMentionHandle = (value: string) => {
    return value.trim().replace(/^@+/, "").toLowerCase();
};

const getChatMentionDisplayName = (user: ChatMentionUser) => {
    const trimmedName = user.name?.trim();

    return trimmedName || `User ${user.id}`;
};

const getChatMentionHandle = (user: ChatMentionUser) => {
    const compactName = getChatMentionDisplayName(user)
        .replace(/\s+/g, "")
        .replace(/[^A-Za-z0-9_-]/g, "");

    return compactName || `User${user.id}`;
};

const buildMentionSuggestions = (users: ChatMentionUser[]) => {
    const seenHandles = new Set<string>();
    const seenIds = new Set<number>();
    const suggestions: ChatMentionSuggestion[] = [];

    users.forEach((user) => {
        if (seenIds.has(user.id)) {
            return;
        }

        seenIds.add(user.id);

        const handle = getChatMentionHandle(user);
        const normalizedHandle = normalizeMentionHandle(handle);

        if (!normalizedHandle || seenHandles.has(normalizedHandle)) {
            return;
        }

        seenHandles.add(normalizedHandle);
        suggestions.push({
            user,
            displayName: getChatMentionDisplayName(user),
            handle,
        });
    });

    return suggestions;
};

const getMentionSuggestionsByHandle = (users: ChatMentionUser[]) => {
    return new Map(
        buildMentionSuggestions(users).map((suggestion) => [
            normalizeMentionHandle(suggestion.handle),
            suggestion,
        ]),
    );
};

export const getChatMentionSuggestions = (
    users: ChatMentionUser[],
    query: string,
    limit = 6,
) => {
    const normalizedQuery = normalizeMentionHandle(query);

    return buildMentionSuggestions(users)
        .filter((suggestion) => {
            if (!normalizedQuery) {
                return true;
            }

            return (
                normalizeMentionHandle(suggestion.handle).includes(
                    normalizedQuery,
                ) ||
                suggestion.displayName.toLowerCase().includes(normalizedQuery)
            );
        })
        .sort((leftSuggestion, rightSuggestion) => {
            const leftHandle = normalizeMentionHandle(leftSuggestion.handle);
            const rightHandle = normalizeMentionHandle(rightSuggestion.handle);
            const leftStartsWithQuery =
                normalizedQuery && leftHandle.startsWith(normalizedQuery);
            const rightStartsWithQuery =
                normalizedQuery && rightHandle.startsWith(normalizedQuery);

            if (leftStartsWithQuery !== rightStartsWithQuery) {
                return leftStartsWithQuery ? -1 : 1;
            }

            return leftSuggestion.displayName.localeCompare(
                rightSuggestion.displayName,
            );
        })
        .slice(0, limit);
};

export const getActiveChatMention = (
    value: string,
    cursorPosition: number,
): ActiveChatMention | null => {
    const safeCursorPosition = Math.max(
        0,
        Math.min(cursorPosition, value.length),
    );
    const valueBeforeCursor = value.slice(0, safeCursorPosition);
    const atIndex = valueBeforeCursor.lastIndexOf("@");

    if (atIndex === -1) {
        return null;
    }

    const charBeforeAt = atIndex > 0 ? valueBeforeCursor[atIndex - 1] : "";
    const query = valueBeforeCursor.slice(atIndex + 1);

    if (
        (charBeforeAt && /[A-Za-z0-9_@-]/.test(charBeforeAt)) ||
        !MENTION_HANDLE_PATTERN.test(query)
    ) {
        return null;
    }

    return {
        start: atIndex,
        end: safeCursorPosition,
        query,
    };
};

const removeMentionFromText = (
    value: string,
    mentionStart: number,
    mentionEnd: number,
) => {
    const beforeMention = value.slice(0, mentionStart);
    let afterMention = value.slice(mentionEnd);

    if (beforeMention.length === 0) {
        return afterMention.trimStart();
    }

    if (afterMention.length === 0) {
        return beforeMention.trimEnd();
    }

    if (afterMention.startsWith(",")) {
        afterMention = afterMention.slice(1);
    }

    if (/\s$/.test(beforeMention) && /^\s/.test(afterMention)) {
        afterMention = afterMention.replace(/^\s+/, "");
    } else if (!/\s$/.test(beforeMention) && !/^\s/.test(afterMention)) {
        afterMention = ` ${afterMention}`;
    }

    return `${beforeMention}${afterMention}`.trim();
};

export const extractChatMentionChip = (
    value: string,
    users: ChatMentionUser[],
    currentUser: ChatMentionUser | null | undefined,
): ChatMentionChip | null => {
    const suggestionsByHandle = getMentionSuggestionsByHandle(users);
    const currentUserHandle = currentUser
        ? normalizeMentionHandle(getChatMentionHandle(currentUser))
        : null;
    let mentionChip: ChatMentionChip | null = null;

    value.replace(MENTION_TEXT_PATTERN, (match, prefix, handle, offset) => {
        if (mentionChip) {
            return match;
        }

        const stringPrefix = String(prefix);
        const mentionHandle = String(handle);
        const mentionStart = Number(offset) + stringPrefix.length;
        const mentionEnd = mentionStart + mentionHandle.length + 1;
        const suggestion = suggestionsByHandle.get(
            normalizeMentionHandle(mentionHandle),
        );

        if (!suggestion) {
            return match;
        }

        mentionChip = {
            value: `@${mentionHandle}`,
            user: suggestion.user,
            displayName: suggestion.displayName,
            isCurrentUser:
                currentUserHandle === normalizeMentionHandle(suggestion.handle),
            remainingText: removeMentionFromText(
                value,
                mentionStart,
                mentionEnd,
            ),
        };

        return match;
    });

    return mentionChip;
};

export const doesChatTextMentionUser = (
    value: string | null,
    users: ChatMentionUser[],
    currentUser: ChatMentionUser | null | undefined,
) => {
    if (!value || !currentUser) {
        return false;
    }

    const suggestionsByHandle = getMentionSuggestionsByHandle(users);
    const currentUserHandle = normalizeMentionHandle(
        getChatMentionHandle(currentUser),
    );
    let isMentioned = false;

    value.replace(MENTION_TEXT_PATTERN, (match, _prefix, handle) => {
        const suggestion = suggestionsByHandle.get(
            normalizeMentionHandle(String(handle)),
        );

        if (
            suggestion &&
            normalizeMentionHandle(suggestion.handle) === currentUserHandle
        ) {
            isMentioned = true;
        }

        return match;
    });

    return isMentioned;
};
