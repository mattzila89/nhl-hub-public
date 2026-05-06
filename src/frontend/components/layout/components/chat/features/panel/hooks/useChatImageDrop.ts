import * as React from "react";

import {
    dataTransferContainsImage,
    getDroppedImageFile,
} from "../../../utils/chatImageFiles";

type UseChatImageDropInput = {
    disabled?: boolean;
};

const useChatImageDrop = ({ disabled = false }: UseChatImageDropInput) => {
    const dragDepthRef = React.useRef(0);
    const [isImageDragActive, setIsImageDragActive] = React.useState(false);
    const [droppedImageFile, setDroppedImageFile] = React.useState<File | null>(
        null,
    );

    const resetDragOverlay = React.useCallback(() => {
        dragDepthRef.current = 0;
        setIsImageDragActive(false);
    }, []);

    const handleChatDragEnter = React.useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            if (disabled || !dataTransferContainsImage(event.dataTransfer)) {
                return;
            }

            event.preventDefault();
            dragDepthRef.current += 1;
            setIsImageDragActive(true);
        },
        [disabled],
    );

    const handleChatDragOver = React.useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            if (disabled || !dataTransferContainsImage(event.dataTransfer)) {
                return;
            }

            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";

            if (!isImageDragActive) {
                setIsImageDragActive(true);
            }
        },
        [disabled, isImageDragActive],
    );

    const handleChatDragLeave = React.useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            if (!isImageDragActive) {
                return;
            }

            event.preventDefault();
            dragDepthRef.current = Math.max(dragDepthRef.current - 1, 0);

            if (dragDepthRef.current === 0) {
                setIsImageDragActive(false);
            }
        },
        [isImageDragActive],
    );

    const handleChatDrop = React.useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            const imageFile = getDroppedImageFile(event.dataTransfer);

            if (!imageFile && !isImageDragActive) {
                return;
            }

            event.preventDefault();
            resetDragOverlay();

            if (!imageFile) {
                return;
            }

            setDroppedImageFile(imageFile);
        },
        [isImageDragActive, resetDragOverlay],
    );

    return {
        droppedImageFile,
        isImageDragActive,
        onDragEnter: handleChatDragEnter,
        onDragLeave: handleChatDragLeave,
        onDragOver: handleChatDragOver,
        onDrop: handleChatDrop,
        clearDroppedImageFile: () => {
            setDroppedImageFile(null);
        },
    };
};

export default useChatImageDrop;
