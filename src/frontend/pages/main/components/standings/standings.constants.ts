import type { Team } from "../../../../../interfaces";
import { teams } from "../../../select-team/team-data";
import type { StandingEntry } from "../../utils/standings.types";

type DivisionCode = "A" | "M" | "C" | "P";
type ConferenceCode = "E" | "W";

export const divisionOrder: DivisionCode[] = ["A", "M", "C", "P"];
export const conferenceOrder: ConferenceCode[] = ["E", "W"];

export const divisionLabelByCode: Record<DivisionCode, string> = {
    A: "Atlantic Division",
    M: "Metropolitan Division",
    C: "Central Division",
    P: "Pacific Division",
};

export const conferenceLabelByCode: Record<ConferenceCode, string> = {
    E: "Eastern Wild Card",
    W: "Western Wild Card",
};

export const teamBrandByAbbrev = new Map<string, Team>(
    teams.map((team) => [team.abbrev, team]),
);

export const sortDivisionStandings = (
    left: StandingEntry,
    right: StandingEntry,
) => {
    return (
        left.divisionSequence - right.divisionSequence ||
        right.points - left.points ||
        right.wins - left.wins
    );
};

const getWildCardSortRank = (standing: StandingEntry) => {
    if (standing.wildcardSequence > 0) {
        return standing.wildcardSequence;
    }

    return standing.conferenceSequence + 100;
};

export const sortWildCardStandings = (
    left: StandingEntry,
    right: StandingEntry,
) => {
    return (
        getWildCardSortRank(left) - getWildCardSortRank(right) ||
        right.points - left.points ||
        right.wins - left.wins
    );
};
