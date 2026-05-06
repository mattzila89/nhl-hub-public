import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { alpha, type SxProps, type Theme } from "@mui/material/styles";
import GameService from "../../../../services/GamesService";

type TheaterVideoSurfaceProps = {
    gameId: number;
    titleVariant: "h4" | "h5" | "h6";
    emptyLabel?: string;
    sx?: SxProps<Theme>;
};

const TheaterVideoSurface = ({
    gameId,
    titleVariant,
    emptyLabel = "No highlight video available for this game yet.",
    sx,
}: TheaterVideoSurfaceProps) => {
    const streamQuery = GameService.useStream(gameId);
    const streamUrl = streamQuery.data?.video_url?.trim();

    return (
        <Paper
            elevation={0}
            sx={[
                {
                    minWidth: 0,
                    minHeight: 0,
                    borderRadius: { xs: 0, md: 1 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#040404",
                    overflow: "hidden",
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {streamQuery.isLoading ? (
                <CircularProgress
                    size={32}
                    sx={{
                        color: alpha("#ffffff", 0.9),
                    }}
                />
            ) : streamUrl ? (
                <Box
                    component="iframe"
                    title={`Game ${gameId} stream`}
                    src={streamUrl}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="origin-when-cross-origin"
                    sx={{
                        width: "100%",
                        height: "100%",
                        border: 0,
                        backgroundColor: "#040404",
                    }}
                />
            ) : (
                <Stack
                    spacing={1}
                    sx={{
                        px: 2,
                        textAlign: "center",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography
                        variant={titleVariant}
                        sx={{
                            fontWeight: 800,
                            color: "#ffffff",
                        }}
                    >
                        Video Screen {gameId}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: alpha("#ffffff", 0.72),
                            maxWidth: 360,
                        }}
                    >
                        {emptyLabel}
                    </Typography>
                </Stack>
            )}
        </Paper>
    );
};

export default TheaterVideoSurface;
