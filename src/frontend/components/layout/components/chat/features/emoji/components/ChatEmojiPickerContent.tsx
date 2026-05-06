import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

import type { ChatEmojiSection } from "../utils/chatEmojiSections";

type ChatEmojiPickerContentProps = {
    disabled?: boolean;
    sections: ChatEmojiSection[];
    onSelectEmoji: (emoji: string) => void;
};

const ChatEmojiPickerContent = ({
    disabled = false,
    sections,
    onSelectEmoji,
}: ChatEmojiPickerContentProps) => {
    return (
        <Box
            sx={{
                maxHeight: 320,
                overflowY: "auto",
                p: 1,
                pr: 0.75,
            }}
        >
            <Stack spacing={1}>
                {sections.map((section) => (
                    <Stack key={section.label} spacing={0.75}>
                        <Typography
                            variant="caption"
                            sx={{
                                px: 0.4,
                                color: alpha("#ffffff", 0.64),
                                fontWeight: 700,
                                fontFamily: "Inter",
                            }}
                        >
                            {section.label}
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(6, minmax(0, 1fr))",
                                gap: 0.4,
                            }}
                        >
                            {section.emojis.map((emoji) => (
                                <Box
                                    key={`${section.label}-${emoji}`}
                                    component="button"
                                    type="button"
                                    aria-label={`Send ${emoji}`}
                                    disabled={disabled}
                                    onClick={() => {
                                        onSelectEmoji(emoji);
                                    }}
                                    sx={{
                                        height: 40,
                                        p: 0,
                                        border: 0,
                                        borderRadius: "12px",
                                        cursor: disabled
                                            ? "default"
                                            : "pointer",
                                        fontSize: 24,
                                        lineHeight: 1,
                                        backgroundColor: alpha(
                                            "#ffffff",
                                            0.04,
                                        ),
                                        transition:
                                            "transform 140ms ease, background-color 140ms ease",
                                        "&:hover": {
                                            backgroundColor: alpha(
                                                "#ffffff",
                                                0.12,
                                            ),
                                            transform: "translateY(-1px)",
                                        },
                                        "&:disabled": {
                                            opacity: 0.68,
                                        },
                                    }}
                                >
                                    {emoji}
                                </Box>
                            ))}
                        </Box>
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
};

export default ChatEmojiPickerContent;
