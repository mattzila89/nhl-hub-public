import { describe, expect, it } from "vitest";
import { BROADCAST_LOGOS } from "./broadcastLogos";

describe("broadcastLogos", () => {
    it("maps common national broadcast networks", () => {
        ["ESPN", "ESPN2", "ESPN+", "TNT", "TBS", "ABC", "NHLN"].forEach(
            (network) => {
                expect(BROADCAST_LOGOS[network]).toBeTruthy();
            },
        );
    });

    it("maps known broadcast aliases to the same asset", () => {
        expect(BROADCAST_LOGOS["HBO MAX"]).toBe(BROADCAST_LOGOS.HBOMAX);
    });
});
