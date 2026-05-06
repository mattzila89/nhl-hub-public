import { describe, expect, it } from "vitest";
import type { ChatMentionUser } from "./chatMentions";
import {
    doesChatTextMentionUser,
    extractChatMentionChip,
    getActiveChatMention,
    getChatMentionSuggestions,
} from "./chatMentions";

const createMentionUser = (
    id: number,
    name: string | null,
): ChatMentionUser => ({
    id,
    name,
    avatar_url: "",
    selected_team: null,
});

describe("chatMentions", () => {
    const morgan = createMentionUser(1, "Morgan Rielly");
    const marner = createMentionUser(2, "Mitch Marner");
    const nylander = createMentionUser(3, "William Nylander");

    it("finds the active mention at the cursor", () => {
        expect(getActiveChatMention("hey @mor", 8)).toEqual({
            start: 4,
            end: 8,
            query: "mor",
        });
    });

    it("ignores email-like text and unsupported mention characters", () => {
        expect(getActiveChatMention("hello test@example.com", 22)).toBeNull();
        expect(getActiveChatMention("hello @mor!", 11)).toBeNull();
    });

    it("returns sorted, de-duplicated mention suggestions", () => {
        const suggestions = getChatMentionSuggestions(
            [nylander, marner, morgan, marner],
            "",
        );

        expect(suggestions.map((suggestion) => suggestion.handle)).toEqual([
            "MitchMarner",
            "MorganRielly",
            "WilliamNylander",
        ]);
    });

    it("extracts a recognized mention chip and removes the mention from text", () => {
        const chip = extractChatMentionChip(
            "Hey @MorganRielly, great game",
            [morgan],
            morgan,
        );

        expect(chip).toMatchObject({
            value: "@MorganRielly",
            displayName: "Morgan Rielly",
            isCurrentUser: true,
            remainingText: "Hey great game",
        });
    });

    it("detects when message text mentions the current user", () => {
        expect(
            doesChatTextMentionUser(
                "thanks @MorganRielly",
                [morgan, marner],
                morgan,
            ),
        ).toBe(true);
        expect(
            doesChatTextMentionUser(
                "thanks @MitchMarner",
                [morgan, marner],
                morgan,
            ),
        ).toBe(false);
    });
});
