import * as React from "react";
import GameService from "../../../../services/GamesService";

const useVideoEditor = (gameId: number) => {
    const streamQuery = GameService.useStream(gameId);
    const saveStreamMutation = GameService.useSaveStream();
    const [editing, setEditing] = React.useState<boolean>(false);
    const [streamUrl, setStreamUrl] = React.useState<string>("");

    const streamSaveError =
        saveStreamMutation.isError && saveStreamMutation.error instanceof Error
            ? saveStreamMutation.error.message
            : undefined;
    const savedStreamUrl = streamQuery.data?.video_url?.trim() ?? "";

    React.useEffect(() => {
        if (!editing) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep draft URL synced to the saved video when not editing.
            setStreamUrl(savedStreamUrl);
        }
    }, [editing, savedStreamUrl]);

    const handleSave = async () => {
        const trimmedStreamUrl = streamUrl.trim();

        if (trimmedStreamUrl === "" || trimmedStreamUrl === savedStreamUrl) {
            setEditing(false);
            return;
        }

        await saveStreamMutation.mutateAsync({
            gameId,
            videoUrl: trimmedStreamUrl,
        });
        setEditing(false);
    };

    return {
        editing,
        isSaving: saveStreamMutation.isPending,
        streamSaveError,
        streamUrl,
        setStreamUrl,
        startEditing: () => setEditing(true),
        save: () => {
            void handleSave();
        },
    };
};

export default useVideoEditor;
