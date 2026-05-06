import type { ChatReactionType } from "../../../../../../../../interfaces";

type ChatReactionOption = {
    type: ChatReactionType;
    label: string;
    emoji: string;
};

export const chatReactionOptions: ChatReactionOption[] = [
    {
        type: "love",
        label: "Love",
        emoji: "♥️",
    },
    {
        type: "laugh",
        label: "Laugh",
        emoji: "😆",
    },
    {
        type: "wow",
        label: "Wow",
        emoji: "😮",
    },
    {
        type: "sad",
        label: "Sad",
        emoji: "😢",
    },
    {
        type: "like",
        label: "Like",
        emoji: "👍",
    },
];
