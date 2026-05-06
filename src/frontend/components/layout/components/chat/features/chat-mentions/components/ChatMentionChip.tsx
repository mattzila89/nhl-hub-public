import { CloseRounded } from "@mui/icons-material";
import { Avatar, IconButton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

import type { ChatMentionChip as ChatMentionChipData } from "../utils/chatMentions";

type ChatMentionChipProps = {
    mention: ChatMentionChipData;
    disabled?: boolean;
    maxLabelWidth?: number;
    variant?: "composer" | "message";
    onRemove?: () => void;
};

const ChatMentionChip = ({
    mention,
    disabled = false,
    maxLabelWidth = 130,
    variant = "message",
    onRemove,
}: ChatMentionChipProps) => {
    const mentionTeamColor =
        mention.user.selected_team?.primaryColor ?? "#6f7d95";
    const isComposerVariant = variant === "composer";

    return (
        <Stack
            direction="row"
            spacing={0.7}
            title={mention.displayName}
            sx={{
                alignItems: "center",
                width: "fit-content",
                maxWidth: "100%",
                p: isComposerVariant ? "5px" : "3px 6px 3px 3px",
                borderRadius: isComposerVariant ? "8px" : "25px",
                color: "#ffffff",
                backgroundColor: isComposerVariant
                    ? alpha("#000000", 0.86)
                    : "#000",
                boxShadow: isComposerVariant
                    ? `0 0 0 1px ${alpha("#ffffff", 0.12)}`
                    : mention.isCurrentUser
                      ? `0 0 0 1px ${alpha("#ffffff", 0.42)}`
                      : `0 0 0 1px ${alpha("#000000", 0.18)}`,
            }}
        >
            <Avatar
                src={mention.user.avatar_url ?? undefined}
                alt={mention.displayName}
                sx={{
                    width: isComposerVariant ? 24 : 21,
                    height: isComposerVariant ? 24 : 21,
                    flexShrink: 0,
                    boxShadow: `0 0 0 2px ${alpha(mentionTeamColor, 0.48)}`,
                }}
            />

            <Typography
                component="span"
                noWrap
                sx={{
                    minWidth: 0,
                    maxWidth: maxLabelWidth,
                    fontFamily: isComposerVariant ? "Inter" : "Inter-Black",
                    fontSize: isComposerVariant ? 13 : 12,
                    fontWeight: 900,
                    lineHeight: 1,
                }}
            >
                {mention.value}
            </Typography>

            {onRemove && (
                <IconButton
                    aria-label="Remove mention"
                    disabled={disabled}
                    onClick={onRemove}
                    sx={{
                        width: 22,
                        height: 22,
                        ml: 0.1,
                        color: alpha("#ffffff", 0.72),
                        "&:hover": {
                            color: "#ffffff",
                            backgroundColor: alpha("#ffffff", 0.12),
                        },
                    }}
                >
                    <CloseRounded sx={{ fontSize: 14 }} />
                </IconButton>
            )}
        </Stack>
    );
};

export default ChatMentionChip;
