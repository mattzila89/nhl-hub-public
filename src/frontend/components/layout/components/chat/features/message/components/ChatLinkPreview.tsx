import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ChatService from "../../../../../../../services/ChatService";

type ChatLinkPreviewProps = {
    url: string;
};

const textClampSx = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
};

const ChatLinkPreview = ({ url }: ChatLinkPreviewProps) => {
    const previewQuery = ChatService.useLinkPreview(url);
    const preview = previewQuery.data;

    if (!preview) {
        return null;
    }

    return (
        <Box
            component="a"
            href={preview.url}
            target="_blank"
            rel="noreferrer noopener"
            sx={{
                display: "block",
                width: "100%",
                maxWidth: 248,
                mt: 0.15,
                textDecoration: "none",
                borderRadius: "10px",
                overflow: "hidden",
                border: `1px solid ${alpha("#ffffff", 0.14)}`,
                backgroundColor: alpha("#0b0d12", 0.32),
                backdropFilter: "blur(10px)",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.16)",
                color: "#ffffff",
                transition: "transform 150ms ease, background-color 150ms ease",
                "&:hover": {
                    transform: "translateY(-1px)",
                    backgroundColor: alpha("#0b0d12", 0.42),
                },
            }}
        >
            {preview.imageUrl && (
                <Box
                    component="img"
                    src={preview.imageUrl}
                    alt={preview.title}
                    sx={{
                        display: "block",
                        width: "100%",
                        height: 124,
                        objectFit: "cover",
                        backgroundColor: alpha("#000000", 0.16),
                    }}
                />
            )}

            <Stack spacing={0.35} sx={{ p: 1 }}>
                <Typography
                    sx={{
                        fontSize: 10,
                        fontFamily: "Inter",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: alpha("#ffffff", 0.62),
                        textTransform: "uppercase",
                        ...textClampSx,
                        WebkitLineClamp: 1,
                    }}
                >
                    {preview.siteName ?? preview.hostname}
                </Typography>

                <Typography
                    sx={{
                        fontSize: 13,
                        fontFamily: "Inter",
                        fontWeight: 700,
                        lineHeight: 1.25,
                        color: "#ffffff",
                        ...textClampSx,
                        WebkitLineClamp: 2,
                    }}
                >
                    {preview.title}
                </Typography>

                {preview.description && (
                    <Typography
                        sx={{
                            fontSize: 11,
                            fontFamily: "Inter",
                            lineHeight: 1.3,
                            color: alpha("#ffffff", 0.76),
                            ...textClampSx,
                            WebkitLineClamp: 3,
                        }}
                    >
                        {preview.description}
                    </Typography>
                )}
            </Stack>
        </Box>
    );
};

export default ChatLinkPreview;
