import { describe, expect, it } from "vitest";
import {
    dataTransferContainsImage,
    getDroppedImageFile,
    isSupportedImageFile,
} from "./chatImageFiles";

const createDataTransfer = ({
    files = [],
    items = [],
}: {
    files?: File[];
    items?: Array<Pick<DataTransferItem, "kind" | "type">>;
}) =>
    ({
        files,
        items,
    }) as unknown as DataTransfer;

describe("chatImageFiles", () => {
    it("accepts image MIME types and known image extensions", () => {
        expect(
            isSupportedImageFile(new File(["avatar"], "avatar.bin", {
                type: "image/png",
            })),
        ).toBe(true);
        expect(
            isSupportedImageFile(new File(["avatar"], "avatar.WEBP", {
                type: "application/octet-stream",
            })),
        ).toBe(true);
        expect(
            isSupportedImageFile(new File(["notes"], "notes.txt", {
                type: "text/plain",
            })),
        ).toBe(false);
    });

    it("detects image drag items", () => {
        expect(
            dataTransferContainsImage(
                createDataTransfer({
                    items: [{ kind: "file", type: "image/jpeg" }],
                }),
            ),
        ).toBe(true);
        expect(
            dataTransferContainsImage(
                createDataTransfer({
                    items: [{ kind: "string", type: "text/plain" }],
                }),
            ),
        ).toBe(false);
    });

    it("returns the first supported dropped image file", () => {
        const textFile = new File(["notes"], "notes.txt", {
            type: "text/plain",
        });
        const imageFile = new File(["image"], "goal.gif", {
            type: "application/octet-stream",
        });

        expect(
            getDroppedImageFile(
                createDataTransfer({
                    files: [textFile, imageFile],
                }),
            ),
        ).toBe(imageFile);
    });
});
