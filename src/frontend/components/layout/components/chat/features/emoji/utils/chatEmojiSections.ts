import type { Team } from "../../../../../../../../interfaces";
import { teams } from "../../../../../../../pages/select-team/team-data";

export type ChatEmojiSection = {
    label: string;
    emojis: string[];
};

const emojiSections: ChatEmojiSection[] = [
    {
        label: "Faces",
        emojis: [
            "😀",
            "😄",
            "😁",
            "😂",
            "🤣",
            "😊",
            "🙂",
            "😉",
            "😍",
            "🥳",
            "😎",
            "🤩",
        ],
    },
    {
        label: "Love",
        emojis: [
            "❤️",
            "🧡",
            "💛",
            "💚",
            "💙",
            "💜",
            "🤍",
            "🤎",
            "💕",
            "💖",
            "💔",
            "❤️‍🔥",
        ],
    },
    {
        label: "Hype",
        emojis: [
            "🔥",
            "💯",
            "✨",
            "👏",
            "🙌",
            "🙏",
            "👍",
            "👌",
            "🤝",
            "👀",
            "🎉",
            "🥂",
        ],
    },
    {
        label: "Game Day",
        emojis: [
            "🏒",
            "🥅",
            "🏆",
            "🚨",
            "🥶",
            "❄️",
            "🧊",
            "😤",
            "🤘",
            "🫡",
            "🎯",
            "📣",
        ],
    },
];

export const getChatEmojiSections = (
    selectedTeam: Team | null | undefined,
): ChatEmojiSection[] => {
    return [
        {
            label: selectedTeam?.name ?? teams[0].name,
            emojis: selectedTeam?.emojis || teams[0].emojis,
        },
        ...emojiSections,
    ];
};
