import * as React from "react";
import { Box, IconButton } from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";

import siren from "../../../../../../../assets/img/siren.png";

type ChatSirenButtonProps = {
    disabled?: boolean;
    onSendSiren: () => void;
};

const sirenHoverPulse = keyframes`
    0% {
        transform: scale(1);
        filter:
            drop-shadow(0 0 0 transparent)
            drop-shadow(0 0 0 transparent);
    }

    50% {
        transform: scale(1.08);
        filter:
            drop-shadow(0 0 10px var(--siren-glow-strong))
            drop-shadow(0 0 18px var(--siren-glow));
    }

    100% {
        transform: scale(1);
        filter:
            drop-shadow(0 0 0 transparent)
            drop-shadow(0 0 0 transparent);
    }
`;

const sirenSendBurst = keyframes`
    0% {
        transform: scale(1);
        filter:
            drop-shadow(0 0 0 transparent)
            drop-shadow(0 0 0 transparent);
    }

    20% {
        transform: scale(0.92);
    }

    55% {
        transform: scale(1.18);
        filter:
            drop-shadow(0 0 14px var(--siren-glow-strong))
            drop-shadow(0 0 24px var(--siren-glow));
    }

    100% {
        transform: scale(1);
        filter:
            drop-shadow(0 0 0 transparent)
            drop-shadow(0 0 0 transparent);
    }
`;

const sirenSendShake = keyframes`
    0% {
        transform: translate3d(0, 0, 0) rotate(0deg);
    }

    22% {
        transform: translate3d(-1px, -2px, 0) rotate(-8deg);
    }

    46% {
        transform: translate3d(2px, -4px, 0) rotate(8deg);
    }

    70% {
        transform: translate3d(-1px, -1px, 0) rotate(-4deg);
    }

    100% {
        transform: translate3d(0, 0, 0) rotate(0deg);
    }
`;

const SIREN_SEND_ANIMATION_MS = 560;

const ChatSirenButton = ({
    disabled = false,
    onSendSiren,
}: ChatSirenButtonProps) => {
    const sirenAccentColor = "#ff3b30";
    const [isSirenSending, setIsSirenSending] = React.useState(false);
    const sirenSendTimeoutRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        return () => {
            if (sirenSendTimeoutRef.current !== null) {
                window.clearTimeout(sirenSendTimeoutRef.current);
            }
        };
    }, []);

    const handleSendSirenClick = () => {
        if (disabled) {
            return;
        }

        setIsSirenSending(true);

        if (sirenSendTimeoutRef.current !== null) {
            window.clearTimeout(sirenSendTimeoutRef.current);
        }

        sirenSendTimeoutRef.current = window.setTimeout(() => {
            setIsSirenSending(false);
            sirenSendTimeoutRef.current = null;
        }, SIREN_SEND_ANIMATION_MS);

        onSendSiren();
    };

    return (
        <IconButton
            aria-label="Quick Reaction"
            disableRipple
            disabled={disabled}
            onClick={handleSendSirenClick}
            sx={{
                "--siren-glow": alpha(sirenAccentColor, 0.32),
                "--siren-glow-strong": alpha(sirenAccentColor, 0.65),
                color: "#fff",
                width: 38,
                height: 38,
                transition: "transform 180ms ease",
                p: 0,
                backgroundColor: "transparent",
                "&:hover": {
                    backgroundColor: "transparent",
                },
                "& .siren-icon": {
                    display: "inline-block",
                    lineHeight: 1,
                    width: 20,
                    transformOrigin: "center",
                    transition: "transform 180ms ease, filter 180ms ease",
                    ...(isSirenSending && {
                        animation: `${sirenSendBurst} ${SIREN_SEND_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) 1, ${sirenSendShake} ${SIREN_SEND_ANIMATION_MS}ms ease-out 1`,
                    }),
                },
                "&:hover .siren-icon": {
                    animation: `${sirenHoverPulse} 900ms ease-in-out infinite`,
                },
                "&.Mui-disabled .siren-icon": {
                    opacity: 0.52,
                    filter: "none",
                },
                "&.Mui-disabled": {
                    backgroundColor: "transparent",
                    opacity: 1,
                },
            }}
        >
            <Box component="img" src={siren} className="siren-icon" alt="Send siren" />
        </IconButton>
    );
};

export default ChatSirenButton;
