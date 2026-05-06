import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type * as React from "react";

import type { GiphyGif } from "../../../../../../../services/GiphyService";
import { getGifAspectRatio } from "../utils/chatGifPickerUtils";

type ChatGifPickerContentProps = {
    gifs: GiphyGif[];
    gifSearchInputFontSize: number;
    isBusy: boolean;
    isInitialLoading: boolean;
    isPaginationError: boolean;
    isRefreshingResults: boolean;
    loadMoreRef: React.RefObject<HTMLDivElement | null>;
    searchValue: string;
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    sendingGifId: string | null;
    error: unknown;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    needsIosInputZoomWorkaround?: boolean;
    onFetchNextPage: () => void;
    onSearchValueChange: (value: string) => void;
    onSelectGif: (gif: GiphyGif) => void;
};

const ChatGifPickerContent = ({
    gifs,
    gifSearchInputFontSize,
    isBusy,
    isInitialLoading,
    isPaginationError,
    isRefreshingResults,
    loadMoreRef,
    searchValue,
    scrollContainerRef,
    sendingGifId,
    error,
    hasNextPage = false,
    isFetchingNextPage = false,
    needsIosInputZoomWorkaround = false,
    onFetchNextPage,
    onSearchValueChange,
    onSelectGif,
}: ChatGifPickerContentProps) => {
    const isEmptyError = Boolean(error) && gifs.length === 0;

    return (
        <Stack spacing={1} sx={{ p: 1 }}>
            <TextField
                placeholder="Search for a GIF"
                size="small"
                value={searchValue}
                onChange={(event) => {
                    onSearchValueChange(event.target.value);
                }}
                slotProps={{
                    input: {
                        endAdornment: isRefreshingResults && (
                            <CircularProgress size={14} sx={{ color: "#fff" }} />
                        ),
                    },
                }}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: gifSearchInputFontSize,
                        fontFamily: "Inter",
                        fontWeight: needsIosInputZoomWorkaround ? 500 : 400,
                        backgroundColor: alpha("#ffffff", 0.06),
                        "& fieldset": {
                            borderColor: alpha("#ffffff", 0.12),
                        },
                        "&:hover fieldset": {
                            borderColor: alpha("#ffffff", 0.22),
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: alpha("#ffffff", 0.28),
                        },
                    },
                    "& .MuiInputBase-input": {
                        fontSize: gifSearchInputFontSize,
                        lineHeight: needsIosInputZoomWorkaround ? 1.25 : 1.35,
                        letterSpacing: needsIosInputZoomWorkaround
                            ? "-0.01em"
                            : "normal",
                    },
                }}
            />

            <Box
                ref={scrollContainerRef}
                sx={{
                    minHeight: 240,
                    maxHeight: 320,
                    overflowY: "auto",
                    pr: 0.25,
                }}
            >
                {isInitialLoading ? (
                    <Stack
                        spacing={1}
                        sx={{
                            minHeight: 240,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CircularProgress sx={{ color: "#fff" }} />
                        <Typography
                            variant="body2"
                            color={alpha("#ffffff", 0.76)}
                        >
                            Loading GIFs...
                        </Typography>
                    </Stack>
                ) : isEmptyError ? (
                    <Alert
                        severity="error"
                        sx={{
                            borderRadius: "12px",
                            backgroundColor: alpha("#341414", 0.9),
                        }}
                    >
                        {error instanceof Error
                            ? error.message
                            : "Failed to load GIFs"}
                    </Alert>
                ) : gifs.length === 0 ? (
                    <Stack
                        spacing={0.75}
                        sx={{
                            minHeight: 240,
                            textAlign: "center",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography
                            variant="body2"
                            color={alpha("#ffffff", 0.76)}
                        >
                            No GIFs found for that search.
                        </Typography>
                        <Typography
                            variant="caption"
                            color={alpha("#ffffff", 0.54)}
                        >
                            Try a team name, player, or reaction.
                        </Typography>
                    </Stack>
                ) : (
                    <Stack spacing={0.75}>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(2, minmax(0, 1fr))",
                                gap: 0.75,
                            }}
                        >
                            {gifs.map((gif) => {
                                const isSendingThisGif =
                                    sendingGifId === gif.id;

                                return (
                                    <Box
                                        key={gif.id}
                                        component="button"
                                        type="button"
                                        aria-label={`Send ${gif.title || "GIF"}`}
                                        disabled={isBusy}
                                        onClick={() => {
                                            onSelectGif(gif);
                                        }}
                                        sx={{
                                            position: "relative",
                                            display: "block",
                                            width: "100%",
                                            p: 0,
                                            border: `1px solid ${alpha("#ffffff", 0.08)}`,
                                            borderRadius: "14px",
                                            overflow: "hidden",
                                            cursor: isBusy
                                                ? "progress"
                                                : "pointer",
                                            backgroundColor: alpha(
                                                "#ffffff",
                                                0.04,
                                            ),
                                            transition:
                                                "transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease",
                                            "&:hover": {
                                                transform: isBusy
                                                    ? "none"
                                                    : "translateY(-2px)",
                                                borderColor: alpha(
                                                    "#ffffff",
                                                    0.24,
                                                ),
                                                boxShadow:
                                                    "0 14px 26px rgba(0, 0, 0, 0.24)",
                                            },
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={gif.previewUrl}
                                            alt={gif.title || "Selected GIF"}
                                            sx={{
                                                display: "block",
                                                width: "100%",
                                                aspectRatio:
                                                    getGifAspectRatio(gif),
                                                objectFit: "cover",
                                                backgroundColor: alpha(
                                                    "#000000",
                                                    0.2,
                                                ),
                                            }}
                                        />

                                        {isSendingThisGif && (
                                            <Stack
                                                sx={{
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    position: "absolute",
                                                    inset: 0,
                                                    backgroundColor: alpha(
                                                        "#02040c",
                                                        0.54,
                                                    ),
                                                }}
                                            >
                                                <CircularProgress
                                                    size={22}
                                                    sx={{ color: "#fff" }}
                                                />
                                            </Stack>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>

                        {hasNextPage && <Box ref={loadMoreRef} sx={{ height: 1 }} />}

                        {isFetchingNextPage && (
                            <Stack
                                spacing={0.75}
                                sx={{
                                    py: 0.5,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <CircularProgress
                                    size={18}
                                    sx={{ color: "#fff" }}
                                />
                                <Typography
                                    variant="caption"
                                    color={alpha("#ffffff", 0.64)}
                                >
                                    Loading more GIFs...
                                </Typography>
                            </Stack>
                        )}

                        {isPaginationError && (
                            <Alert
                                severity="error"
                                action={
                                    <Button
                                        color="inherit"
                                        size="small"
                                        onClick={onFetchNextPage}
                                    >
                                        Retry
                                    </Button>
                                }
                                sx={{
                                    borderRadius: "12px",
                                    backgroundColor: alpha("#341414", 0.9),
                                }}
                            >
                                Couldn&apos;t load more GIFs.
                            </Alert>
                        )}
                    </Stack>
                )}
            </Box>
        </Stack>
    );
};

export default ChatGifPickerContent;
