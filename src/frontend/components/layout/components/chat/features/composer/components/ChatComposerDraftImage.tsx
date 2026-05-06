import { CloseRounded, Send } from "@mui/icons-material";
import {
    Box,
    CircularProgress,
    IconButton,
    Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

type ChatDraftImage = {
    previewUrl: string;
    displayName: string;
};

type ChatComposerDraftImageProps = {
    draftImage: ChatDraftImage;
    disabled?: boolean;
    sending?: boolean;
    onClear: () => void;
    onSend: () => void;
};

const ChatComposerDraftImage = ({
    draftImage,
    disabled = false,
    sending = false,
    onClear,
    onSend,
}: ChatComposerDraftImageProps) => {
    return (
        <Box sx={{ p: 1 }}>
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    p: 1,
                    borderRadius: "20px",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: `1px solid ${alpha("#ffffff", 0.12)}`,
                    backgroundColor: alpha("#ffffff", 0.06),
                }}
            >
                <Box
                    component="img"
                    src={draftImage.previewUrl}
                    alt={draftImage.displayName}
                    sx={{
                        width: 64,
                        height: 64,
                        flexShrink: 0,
                        objectFit: "cover",
                        borderRadius: "14px",
                        backgroundColor: alpha("#000000", 0.18),
                    }}
                />

                <Stack direction="row" spacing={0.4} sx={{ alignItems: "center" }}>
                    <IconButton
                        aria-label="Remove image draft"
                        disabled={disabled}
                        onClick={onClear}
                        sx={{
                            width: 32,
                            height: 32,
                            color: alpha("#ffffff", 0.78),
                            backgroundColor: alpha("#ffffff", 0.06),
                            "&:hover": {
                                backgroundColor: alpha("#ffffff", 0.12),
                            },
                        }}
                    >
                        <CloseRounded fontSize="small" />
                    </IconButton>

                    <IconButton
                        aria-label="Send image"
                        disabled={disabled}
                        onClick={onSend}
                        sx={{
                            width: 34,
                            height: 34,
                            color: "#fff",
                            backgroundColor: alpha("#ffffff", 0.1),
                            "&:hover": {
                                backgroundColor: alpha("#ffffff", 0.16),
                            },
                        }}
                    >
                        {sending ? (
                            <CircularProgress size={16} sx={{ color: "#fff" }} />
                        ) : (
                            <Send fontSize="small" />
                        )}
                    </IconButton>
                </Stack>
            </Stack>
        </Box>
    );
};

export default ChatComposerDraftImage;
