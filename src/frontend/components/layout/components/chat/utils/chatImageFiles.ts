const IMAGE_FILE_EXTENSION_PATTERN = /\.(png|jpe?g|webp|gif)$/i;

export const isSupportedImageFile = (file: File) => {
    return (
        file.type.startsWith("image/") ||
        IMAGE_FILE_EXTENSION_PATTERN.test(file.name)
    );
};

export const dataTransferContainsImage = (
    dataTransfer: DataTransfer | null,
) => {
    if (!dataTransfer) {
        return false;
    }

    const dragItems = Array.from(dataTransfer.items ?? []);

    return dragItems.some((item) => {
        return (
            item.kind === "file" &&
            (item.type.startsWith("image/") || item.type === "")
        );
    });
};

export const getDroppedImageFile = (dataTransfer: DataTransfer | null) => {
    if (!dataTransfer) {
        return null;
    }

    return (
        Array.from(dataTransfer.files).find((file) => {
            return isSupportedImageFile(file);
        }) ?? null
    );
};
