import * as React from "react";
import {
    IconButton,
    Popover,
    useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import GiphyService, { type GiphyGif } from "../../../../../../services/GiphyService";
import { Gif } from "@mui/icons-material";
import ChatGifPickerContent from "./components/ChatGifPickerContent";
import {
    GIF_SCROLL_ROOT_MARGIN,
    GIF_SEARCH_DEBOUNCE_MS,
} from "./utils/chatGifPickerUtils";
import useNeedsIosInputZoomWorkaround from "../../hooks/useNeedsIosInputZoomWorkaround";

type ChatGifPickerProps = {
    disabled?: boolean;
    onSendGif: (gif: GiphyGif) => Promise<void>;
};

const ChatGifPicker = ({ disabled = false, onSendGif }: ChatGifPickerProps) => {
    const needsIosInputZoomWorkaround = useNeedsIosInputZoomWorkaround();
    const isMobileViewport = useMediaQuery("(max-width: 768px)");
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [searchValue, setSearchValue] = React.useState("");
    const [sendingGifId, setSendingGifId] = React.useState<string | null>(null);
    const [debouncedSearchValue, setDebouncedSearchValue] = React.useState("");
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
    const loadMoreRef = React.useRef<HTMLDivElement | null>(null);
    const pickerOpen = Boolean(anchorEl);
    const trimmedSearchValue = searchValue.trim();
    const gifSearchInputFontSize = needsIosInputZoomWorkaround ? 16 : 14;
    const isWaitingForSearch =
        pickerOpen &&
        trimmedSearchValue !== "" &&
        trimmedSearchValue !== debouncedSearchValue;

    React.useEffect(() => {
        const nextDebouncedSearchValue = pickerOpen ? trimmedSearchValue : "";
        const debounceDelay =
            pickerOpen && trimmedSearchValue !== "" ? GIF_SEARCH_DEBOUNCE_MS : 0;

        const timeoutId = window.setTimeout(() => {
            setDebouncedSearchValue(nextDebouncedSearchValue);
        }, debounceDelay);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [pickerOpen, trimmedSearchValue]);

    const gifsQuery = GiphyService.useInfiniteSearch({
        query: debouncedSearchValue,
        enabled: pickerOpen,
    });
    const gifs =
        gifsQuery.data?.pages.flatMap((page) => {
            return page.gifs;
        }) ?? [];
    const {
        fetchNextPage,
        hasNextPage,
        isError,
        isFetching,
        isFetchingNextPage,
        isLoading,
    } = gifsQuery;
    const isBusy = disabled || sendingGifId !== null;
    const isInitialLoading = isLoading && gifs.length === 0;
    const isPaginationError = isError && gifs.length > 0;
    const isRefreshingResults =
        isWaitingForSearch || (isFetching && !isFetchingNextPage);

    React.useEffect(() => {
        if (
            !pickerOpen ||
            gifs.length === 0 ||
            !hasNextPage ||
            isFetchingNextPage ||
            isError ||
            isWaitingForSearch
        ) {
            return;
        }

        const scrollContainer = scrollContainerRef.current;
        const loadMoreTarget = loadMoreRef.current;

        if (!scrollContainer || !loadMoreTarget) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries.some((entry) => entry.isIntersecting)) {
                    return;
                }

                void fetchNextPage();
            },
            {
                root: scrollContainer,
                rootMargin: GIF_SCROLL_ROOT_MARGIN,
                threshold: 0.01,
            },
        );

        observer.observe(loadMoreTarget);

        return () => {
            observer.disconnect();
        };
    }, [
        fetchNextPage,
        gifs.length,
        hasNextPage,
        isError,
        isFetchingNextPage,
        isWaitingForSearch,
        pickerOpen,
    ]);

    const handleClose = () => {
        setAnchorEl(null);
        setSearchValue("");
        setSendingGifId(null);
    };

    const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
        if (pickerOpen) {
            handleClose();
            return;
        }

        setAnchorEl(event.currentTarget);
    };

    const handleGifSelect = async (gif: GiphyGif) => {
        if (isBusy) {
            return;
        }

        try {
            setSendingGifId(gif.id);
            await onSendGif(gif);
            handleClose();
        } catch {
            setSendingGifId(null);
        }
    };

    return (
        <>
            <IconButton
                aria-label="Open GIF picker"
                aria-expanded={pickerOpen || undefined}
                aria-haspopup="dialog"
                disabled={disabled}
                onClick={handleToggle}
                sx={{
                    width: 34,
                    height: 34,
                    color: "#fff",
                    backgroundColor: alpha("#ffffff", 0.06),
                    "&:hover": {
                        backgroundColor: alpha("#ffffff", 0.12),
                    },
                    "&.Mui-disabled": {
                        color: alpha("#ffffff", 0.58),
                        backgroundColor: alpha("#ffffff", 0.05),
                        opacity: 1,
                    },
                }}
            >
                <Gif />
            </IconButton>

            <Popover
                anchorEl={anchorEl}
                open={pickerOpen}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            width: isMobileViewport
                                ? "calc(100vw - 16px)"
                                : 348,
                            maxWidth: "calc(100vw - 20px)",
                            maxHeight: isMobileViewport ? 460 : 430,
                            overflow: "hidden",
                            mb: 1,
                            borderRadius: isMobileViewport ? "20px" : "18px",
                            border: `1px solid ${alpha("#ffffff", 0.16)}`,
                            background:
                                "linear-gradient(180deg, rgba(10, 14, 24, 0.96) 0%, rgba(6, 8, 16, 0.94) 100%)",
                            backdropFilter: "blur(16px)",
                            boxShadow:
                                "0 24px 48px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                        },
                    },
                }}
            >
                <ChatGifPickerContent
                    gifs={gifs}
                    gifSearchInputFontSize={gifSearchInputFontSize}
                    isBusy={isBusy}
                    isInitialLoading={isInitialLoading}
                    isPaginationError={isPaginationError}
                    isRefreshingResults={isRefreshingResults}
                    loadMoreRef={loadMoreRef}
                    searchValue={searchValue}
                    scrollContainerRef={scrollContainerRef}
                    sendingGifId={sendingGifId}
                    error={gifsQuery.error}
                    hasNextPage={gifsQuery.hasNextPage}
                    isFetchingNextPage={gifsQuery.isFetchingNextPage}
                    needsIosInputZoomWorkaround={needsIosInputZoomWorkaround}
                    onFetchNextPage={() => {
                        void gifsQuery.fetchNextPage();
                    }}
                    onSearchValueChange={setSearchValue}
                    onSelectGif={(gif) => {
                        void handleGifSelect(gif);
                    }}
                />
            </Popover>
        </>
    );
};

export default ChatGifPicker;
