import { Avatar, Box, Paper, Popper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

import type { ChatMentionSuggestion } from "../utils/chatMentions";

type ChatMentionSuggestionsPopperProps = {
    anchorEl: HTMLElement | null;
    highlightedIndex: number;
    open: boolean;
    suggestions: ChatMentionSuggestion[];
    onHighlight: (index: number) => void;
    onSelect: (suggestion: ChatMentionSuggestion) => void;
};

const ChatMentionSuggestionsPopper = ({
    anchorEl,
    highlightedIndex,
    open,
    suggestions,
    onHighlight,
    onSelect,
}: ChatMentionSuggestionsPopperProps) => {
    return (
        <Popper
            open={open}
            anchorEl={anchorEl}
            placement="top-start"
            sx={{
                zIndex: 1400,
                width: 260,
                maxWidth: "calc(100vw - 32px)",
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    mb: 0.75,
                    overflow: "hidden",
                    borderRadius: "8px",
                    border: `1px solid ${alpha("#ffffff", 0.14)}`,
                    backgroundColor: alpha("#10141f", 0.96),
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 18px 40px rgba(0, 0, 0, 0.34)",
                }}
            >
                <Stack sx={{ p: 0.4 }}>
                    {suggestions.map((suggestion, suggestionIndex) => {
                        const isHighlighted =
                            suggestionIndex === highlightedIndex;
                        const teamColor =
                            suggestion.user.selected_team?.primaryColor ??
                            "#6f7d95";

                        return (
                            <Box
                                key={suggestion.user.id}
                                component="button"
                                type="button"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    onSelect(suggestion);
                                }}
                                onMouseEnter={() => {
                                    onHighlight(suggestionIndex);
                                }}
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.85,
                                    p: "7px 9px",
                                    border: 0,
                                    borderRadius: "6px",
                                    color: "#ffffff",
                                    backgroundColor: isHighlighted
                                        ? alpha("#ffffff", 0.12)
                                        : "transparent",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    "&:hover": {
                                        backgroundColor: alpha("#ffffff", 0.12),
                                    },
                                }}
                            >
                                <Avatar
                                    src={suggestion.user.avatar_url ?? undefined}
                                    alt={suggestion.displayName}
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        boxShadow: `0 0 0 2px ${alpha(teamColor, 0.5)}`,
                                    }}
                                />

                                <Stack spacing={0.1} sx={{ minWidth: 0 }}>
                                    <Typography
                                        noWrap
                                        sx={{
                                            fontFamily: "Inter",
                                            fontSize: 12,
                                            fontWeight: 800,
                                            lineHeight: 1.15,
                                        }}
                                    >
                                        @{suggestion.handle}
                                    </Typography>
                                    <Typography
                                        noWrap
                                        sx={{
                                            color: alpha("#ffffff", 0.62),
                                            fontFamily: "Inter",
                                            fontSize: 10,
                                            fontWeight: 600,
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {suggestion.displayName}
                                    </Typography>
                                </Stack>
                            </Box>
                        );
                    })}
                </Stack>
            </Paper>
        </Popper>
    );
};

export default ChatMentionSuggestionsPopper;
