import { Stack, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ChatReactionType } from "../../../../../../../../interfaces";

import { formatReactionTooltip } from "../utils/chatMessageFormatting";

type ChatReactionCount = {
    type: ChatReactionType;
    label: string;
    emoji: string;
    count: number;
    names: string[];
};

type ChatReactionSummaryProps = {
    isMobileViewport: boolean;
    isOwnMessage: boolean;
    reactionBadgeRightOffset: number;
    reactionCounts: ChatReactionCount[];
};

const ChatReactionSummary = ({
    isMobileViewport,
    isOwnMessage,
    reactionBadgeRightOffset,
    reactionCounts,
}: ChatReactionSummaryProps) => {
    if (reactionCounts.length === 0) {
        return null;
    }

    const reactionSummaryEmojiFontSize = isMobileViewport ? 13 : 11;
    const reactionSummaryCountFontSize = isMobileViewport ? 11 : 10;

    return (
        <Stack
            direction="row"
            spacing={0.35}
            sx={{
                alignItems: "center",
                width: "fit-content",
                position: "absolute",
                bottom: -11,
                ...(isOwnMessage
                    ? {
                          left: reactionBadgeRightOffset,
                          ml: "auto",
                      }
                    : {
                          right: reactionBadgeRightOffset,
                          mr: "auto",
                      }),
            }}
        >
            {reactionCounts.map((reactionOption) => (
                <Tooltip
                    key={reactionOption.type}
                    title={formatReactionTooltip(reactionOption.names)}
                    arrow
                    placement="top"
                >
                    <Stack
                        direction="row"
                        spacing={0.25}
                        sx={{
                            alignItems: "center",
                            p: isMobileViewport ? "2px 6px" : "1px 3px",
                            borderRadius: "999px",
                            backgroundColor: alpha("#111111", 0.82),
                            boxShadow: "0 8px 18px rgba(0, 0, 0, 0.18)",
                        }}
                    >
                        <Typography
                            component="span"
                            sx={{
                                lineHeight: "unset",
                                fontSize: reactionSummaryEmojiFontSize,
                            }}
                        >
                            {reactionOption.emoji}
                        </Typography>

                        {reactionOption.count > 1 && (
                            <Typography
                                component="span"
                                sx={{
                                    color: alpha("#ffffff", 0.82),
                                    fontSize: reactionSummaryCountFontSize,
                                    lineHeight: 1,
                                    fontWeight: 600,
                                    fontFamily: "Inter",
                                }}
                            >
                                {reactionOption.count}
                            </Typography>
                        )}
                    </Stack>
                </Tooltip>
            ))}
        </Stack>
    );
};

export default ChatReactionSummary;
