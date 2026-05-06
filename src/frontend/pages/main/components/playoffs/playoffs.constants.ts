export type BracketCardSize = "round1" | "round2" | "conference" | "final";

type BracketSlot = {
    seriesLetter: string;
    column: number;
    row: number;
    rowSpan?: number;
    size: BracketCardSize;
};

export const PLAYOFF_BRACKET_YEAR = new Date().getFullYear();

export const playoffBracketSlots: BracketSlot[] = [
    { seriesLetter: "E", column: 1, row: 1, size: "round1" },
    { seriesLetter: "F", column: 1, row: 3, size: "round1" },
    { seriesLetter: "G", column: 1, row: 5, size: "round1" },
    { seriesLetter: "H", column: 1, row: 7, size: "round1" },
    { seriesLetter: "K", column: 2, row: 2, rowSpan: 2, size: "round2" },
    { seriesLetter: "L", column: 2, row: 6, rowSpan: 2, size: "round2" },
    { seriesLetter: "N", column: 3, row: 4, rowSpan: 2, size: "conference" },
    { seriesLetter: "O", column: 4, row: 4, rowSpan: 2, size: "final" },
    { seriesLetter: "M", column: 5, row: 4, rowSpan: 2, size: "conference" },
    { seriesLetter: "I", column: 6, row: 2, rowSpan: 2, size: "round2" },
    { seriesLetter: "J", column: 6, row: 6, rowSpan: 2, size: "round2" },
    { seriesLetter: "A", column: 7, row: 1, size: "round1" },
    { seriesLetter: "B", column: 7, row: 3, size: "round1" },
    { seriesLetter: "C", column: 7, row: 5, size: "round1" },
    { seriesLetter: "D", column: 7, row: 7, size: "round1" },
];
