import { AddReactionRounded } from "@mui/icons-material";
import { Box, IconButton, Popover, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type * as React from "react";
import type { ChatReactionType } from "../../../../../../../../interfaces";

import { chatReactionOptions } from "../utils/chatReactions";

type ChatReactionPickerProps = {
    actionControlButtonSx: object;
    anchorEl: HTMLElement | null;
    currentUserReactionType?: ChatReactionType | null;
    isMobileViewport: boolean;
    open: boolean;
    onClose: () => void;
    onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onSelectReaction: (reactionType: ChatReactionType) => void;
};

const ChatReactionPicker = ({
    actionControlButtonSx,
    anchorEl,
    currentUserReactionType = null,
    isMobileViewport,
    open,
    onClose,
    onToggle,
    onSelectReaction,
}: ChatReactionPickerProps) => {
    const reactionPickerButtonSize = isMobileViewport ? 42 : 28;
    const reactionPickerEmojiFontSize = isMobileViewport ? 26 : 18;

    return (
        <Box
            sx={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
            }}
        >
            <Popover
                anchorEl={anchorEl}
                open={open}
                onClose={onClose}
                marginThreshold={8}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                slotProps={{
                    backdrop: {
                        sx: {
                            backgroundColor: isMobileViewport
                                ? alpha("#04070d", 0.46)
                                : "transparent",
                            backdropFilter: isMobileViewport
                                ? "blur(8px)"
                                : "none",
                        },
                    },
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: "hidden",
                            mb: isMobileViewport ? 1.25 : 0.75,
                            p: isMobileViewport ? 0.65 : 0.35,
                            maxWidth: isMobileViewport
                                ? "calc(100vw - 28px)"
                                : "calc(100vw - 16px)",
                            borderRadius: isMobileViewport ? "24px" : "999px",
                            border: `1px solid ${alpha("#ffffff", 0.12)}`,
                            background: isMobileViewport
                                ? "linear-gradient(180deg, rgba(34, 34, 40, 0.98) 0%, rgba(17, 17, 20, 0.96) 100%)"
                                : undefined,
                            backgroundColor: isMobileViewport
                                ? undefined
                                : alpha("#151515", 0.94),
                            backdropFilter: isMobileViewport
                                ? "blur(18px)"
                                : "blur(8px)",
                            boxShadow: isMobileViewport
                                ? "0 28px 60px rgba(0, 0, 0, 0.42)"
                                : "0 14px 28px rgba(0, 0, 0, 0.26)",
                        },
                    },
                }}
            >
                <Stack direction="row" spacing={isMobileViewport ? 0.55 : 0.25}>
                    {chatReactionOptions.map((reactionOption) => {
                        const isSelected =
                            currentUserReactionType === reactionOption.type;

                        return (
                            <Box
                                key={reactionOption.type}
                                component="button"
                                type="button"
                                aria-label={`React with ${reactionOption.label}`}
                                onClick={() => {
                                    onSelectReaction(reactionOption.type);
                                }}
                                sx={{
                                    width: reactionPickerButtonSize,
                                    height: reactionPickerButtonSize,
                                    p: 0,
                                    border: 0,
                                    borderRadius: "999px",
                                    cursor: "pointer",
                                    fontSize: reactionPickerEmojiFontSize,
                                    lineHeight: isMobileViewport ? 1.4 : 1.66,
                                    backgroundColor: isSelected
                                        ? alpha("#ffffff", 0.18)
                                        : isMobileViewport
                                          ? alpha("#ffffff", 0.05)
                                          : "transparent",
                                    transition:
                                        "background-color 140ms ease, transform 140ms ease",
                                    "&:hover": {
                                        backgroundColor: alpha("#ffffff", 0.16),
                                        transform: "translateY(-2px)",
                                    },
                                }}
                            >
                                {reactionOption.emoji}
                            </Box>
                        );
                    })}
                </Stack>
            </Popover>

            <IconButton
                aria-label="Open reaction menu"
                aria-expanded={open || undefined}
                size="small"
                onClick={onToggle}
                sx={actionControlButtonSx}
            >
                <AddReactionRounded
                    sx={{
                        fontSize: isMobileViewport ? 17 : 15,
                    }}
                />
            </IconButton>
        </Box>
    );
};

export default ChatReactionPicker;
