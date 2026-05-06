import { Avatar, Box, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ChatMessageReadReceipt } from "../../../../../../../../interfaces";

type ChatReadReceiptsProps = {
    isMobileViewport: boolean;
    readReceiptAvatarSize: number;
    readReceipts: ChatMessageReadReceipt[];
};

const ChatReadReceipts = ({
    isMobileViewport,
    readReceiptAvatarSize,
    readReceipts,
}: ChatReadReceiptsProps) => {
    if (readReceipts.length === 0) {
        return null;
    }

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                width: "100%",
                px: 0.75,
                pt: 1.1,
            }}
        >
            {readReceipts.map((receipt, index) => {
                const readerName = receipt.user?.name ?? `User ${receipt.user_id}`;
                const readerTeamColor =
                    receipt.user?.selected_team?.primaryColor ?? "#7b8ca9";

                return (
                    <Tooltip
                        key={receipt.user_id}
                        title={readerName}
                        arrow
                        placement="top"
                    >
                        <Avatar
                            src={receipt.user?.avatar_url ?? undefined}
                            alt={readerName}
                            sx={{
                                width: readReceiptAvatarSize,
                                height: readReceiptAvatarSize,
                                ml: index === 0 ? 0 : -0.45,
                                border: `2px solid ${alpha(readerTeamColor, 0.92)}`,
                                boxShadow: "0 6px 14px rgba(0, 0, 0, 0.26)",
                                backgroundColor: alpha("#0f121a", 0.94),
                                fontSize: isMobileViewport ? 10 : 9,
                                fontFamily: "Inter-Black",
                            }}
                        >
                            {readerName.charAt(0).toUpperCase()}
                        </Avatar>
                    </Tooltip>
                );
            })}
        </Box>
    );
};

export default ChatReadReceipts;
