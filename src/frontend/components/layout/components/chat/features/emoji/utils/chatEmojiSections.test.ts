import { describe, expect, it } from "vitest";
import { teams } from "../../../../../../../pages/select-team/team-data";
import { getChatEmojiSections } from "./chatEmojiSections";

describe("chatEmojiSections", () => {
    it("starts with the selected team's emoji section", () => {
        const selectedTeam = teams.find((team) => team.abbrev === "DET");

        expect(selectedTeam).toBeDefined();

        const sections = getChatEmojiSections(selectedTeam);

        expect(sections[0]).toEqual({
            label: selectedTeam?.name,
            emojis: selectedTeam?.emojis,
        });
    });

    it("falls back to the NHL Hub team section when no team is selected", () => {
        const sections = getChatEmojiSections(null);

        expect(sections[0]).toEqual({
            label: teams[0].name,
            emojis: teams[0].emojis,
        });
    });

    it("includes the shared emoji sections", () => {
        const labels = getChatEmojiSections(undefined).map((section) => {
            return section.label;
        });

        expect(labels).toEqual([
            teams[0].name,
            "Faces",
            "Love",
            "Hype",
            "Game Day",
        ]);
    });
});
