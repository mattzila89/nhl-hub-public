import { TextField } from "@mui/material";
import useNeedsIosInputZoomWorkaround from "../../../../components/layout/components/chat/hooks/useNeedsIosInputZoomWorkaround";

type HighlighVideoUrlEditorProps = {
    streamUrl: string;
    onStreamUrlChange: (value: string) => void;
    streamSaveError?: string;
};

const HighlighVideoUrlEditor = ({
    streamUrl,
    onStreamUrlChange,
    streamSaveError,
}: HighlighVideoUrlEditorProps) => {
    const needsIosInputZoomWorkaround = useNeedsIosInputZoomWorkaround();

    return (
        <TextField
            autoFocus
            placeholder="Enter URL..."
            size="small"
            rows={4}
            multiline
            value={streamUrl}
            onChange={(event) => onStreamUrlChange(event.target.value)}
            error={Boolean(streamSaveError)}
            helperText={streamSaveError}
            sx={{
                color: "#fff",
                "& .MuiOutlinedInput-notchedOutline": {
                    border: "1px solid rgba(255, 255, 255, 0.28)",
                },
                "& .MuiOutlinedInput-root": {
                    p: "10px 14px",
                    borderRadius: 0.75,
                    fontFamily: "Inter",
                    fontSize: needsIosInputZoomWorkaround ? 16 : 14,
                },
                "& .MuiInputBase-input": {
                    fontSize: needsIosInputZoomWorkaround ? 16 : 14,
                    lineHeight: needsIosInputZoomWorkaround ? 1.25 : 1.35,
                    letterSpacing: needsIosInputZoomWorkaround
                        ? "-0.01em"
                        : "normal",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#fff",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#fff",
                },
            }}
        />
    );
};

export default HighlighVideoUrlEditor;
