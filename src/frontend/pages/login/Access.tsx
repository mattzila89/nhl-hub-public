import { useNavigate } from "react-router-dom";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useAuth } from "../../../AuthProvider";
import "./access.css";
import { Alert, Box, useMediaQuery } from "@mui/material";
import UserService from "../../services/UserService";
import type { Login } from "../../../interfaces";

const CODE_LENGTH = 8;
const KEYPAD_BREAKPOINT_QUERY = "(max-width: 767px)";
const MOBILE_KEYPAD_ROWS = [
    [
        { digit: "1", letters: "" },
        { digit: "2", letters: "ABC" },
        { digit: "3", letters: "DEF" },
    ],
    [
        { digit: "4", letters: "GHI" },
        { digit: "5", letters: "JKL" },
        { digit: "6", letters: "MNO" },
    ],
    [
        { digit: "7", letters: "PQRS" },
        { digit: "8", letters: "TUV" },
        { digit: "9", letters: "WXYZ" },
    ],
];

type AccessError = Error & {
    status?: number;
    code?: string;
    triesRemaining?: number;
    retryAfterSeconds?: number;
    blockedUntil?: number;
};

const getCurrentTimestamp = () => new Date().getTime();

const formatLockoutCountdown = (remainingMs: number) => {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const getAccessError = (error: unknown): AccessError | null => {
    if (error instanceof Error) {
        return error as AccessError;
    }

    return null;
};

const createEmptyCode = (): string[] => {
    return Array.from({ length: CODE_LENGTH }, () => "");
};

const Access = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const showKeypad = useMediaQuery(KEYPAD_BREAKPOINT_QUERY);
    const [code, setCode] = useState<string[]>(() => createEmptyCode());
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(() => getCurrentTimestamp());
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const logMeIn = UserService.useLogin();
    const isLockedOut = blockedUntil !== null && blockedUntil > currentTime;
    const remainingLockoutMs = Math.max(0, (blockedUntil ?? 0) - currentTime);
    const isInputDisabled = isLockedOut || logMeIn.isPending;
    const filledDigits = code.filter((digit) => digit !== "").length;

    useEffect(() => {
        const fadeTimeoutId = window.setTimeout(() => {
            setIsVisible(true);
        }, 500);
        const focusTimeoutId = window.setTimeout(() => {
            if (!showKeypad && !isLockedOut && !logMeIn.isPending) {
                inputsRef.current[0]?.focus();
            }
        }, 650);

        return () => {
            window.clearTimeout(fadeTimeoutId);
            window.clearTimeout(focusTimeoutId);
        };
    }, [isLockedOut, logMeIn.isPending, showKeypad]);

    useEffect(() => {
        if (!isLockedOut || blockedUntil === null) {
            return;
        }

        const intervalId = window.setInterval(() => {
            const nextTime = getCurrentTimestamp();

            if (nextTime >= blockedUntil) {
                window.clearInterval(intervalId);
                setCurrentTime(nextTime);
                setBlockedUntil(null);
                setStatusMessage(null);
                setCode(createEmptyCode());
                if (!showKeypad) {
                    inputsRef.current[0]?.focus();
                }
                return;
            }

            setCurrentTime(nextTime);
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [blockedUntil, isLockedOut, showKeypad]);

    const resetCodeInputs = () => {
        setCode(createEmptyCode());
    };

    const submitCode = async (enteredCode: string) => {
        try {
            const data: Login = await logMeIn.mutateAsync(enteredCode);

            setBlockedUntil(null);
            setStatusMessage(null);
            setIsSuccess(true);

            window.setTimeout(() => {
                setIsVisible(false);
            }, 300);

            window.setTimeout(() => {
                login(data.token, data.user);
                navigate(
                    data.user.selected_team !== null ? "/home" : "/select-team",
                );
            }, 1200);
        } catch (error) {
            const accessError = getAccessError(error);

            setIsError(true);
            window.setTimeout(() => setIsError(false), 400);
            resetCodeInputs();

            if (accessError?.status === 429) {
                const lockoutStartTime = getCurrentTimestamp();
                const nextBlockedUntil =
                    typeof accessError.blockedUntil === "number" &&
                    accessError.blockedUntil > lockoutStartTime
                        ? accessError.blockedUntil
                        : typeof accessError.retryAfterSeconds === "number"
                          ? lockoutStartTime +
                            accessError.retryAfterSeconds * 1000
                          : lockoutStartTime;

                setCurrentTime(lockoutStartTime);
                setBlockedUntil(nextBlockedUntil);
                setStatusMessage(
                    accessError.message ||
                        "Too many incorrect access code attempts.",
                );
                return;
            }

            setBlockedUntil(null);
            setStatusMessage(
                accessError?.message ||
                    "Unable to verify the access code right now.",
            );
            if (!showKeypad) {
                inputsRef.current[0]?.focus();
            }
        }
    };

    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value) || isInputDisabled) {
            return;
        }

        const nextCode = [...code];
        nextCode[index] = value;
        setCode(nextCode);
        setStatusMessage(null);

        if (value && index < CODE_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }

        if (!nextCode.every((digit) => digit !== "")) {
            return;
        }

        inputsRef.current[index]?.blur();
        void submitCode(nextCode.join(""));
    };

    const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
        if (isInputDisabled) {
            return;
        }

        if (event.key === "Backspace" && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleDigitPress = (digit: string) => {
        if (!/^\d$/.test(digit) || isInputDisabled) {
            return;
        }

        const nextOpenIndex = code.findIndex((value) => value === "");

        if (nextOpenIndex === -1) {
            return;
        }

        const nextCode = [...code];
        nextCode[nextOpenIndex] = digit;
        setCode(nextCode);
        setStatusMessage(null);

        if (nextCode.every((value) => value !== "")) {
            void submitCode(nextCode.join(""));
        }
    };

    const handleDeletePress = () => {
        if (isInputDisabled) {
            return;
        }

        const nextCode = [...code];
        let lastFilledIndex = -1;

        for (let index = nextCode.length - 1; index >= 0; index -= 1) {
            if (nextCode[index] !== "") {
                lastFilledIndex = index;
                break;
            }
        }

        if (lastFilledIndex === -1) {
            return;
        }

        nextCode[lastFilledIndex] = "";
        setCode(nextCode);
        setStatusMessage(null);
    };

    const handleGlobalKeyDown = useEffectEvent((event: KeyboardEvent) => {
        if (/^\d$/.test(event.key)) {
            event.preventDefault();
            handleDigitPress(event.key);
            return;
        }

        if (event.key === "Backspace") {
            event.preventDefault();
            handleDeletePress();
        }
    });

    useEffect(() => {
        if (!showKeypad || isInputDisabled) {
            return;
        }

        window.addEventListener("keydown", handleGlobalKeyDown);

        return () => {
            window.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, [isInputDisabled, showKeypad]);

    return (
        <Box className={`overlay ${isVisible ? "fade-in" : ""}`}>
            <Box className={`access-content ${isSuccess ? "success" : ""}`}>
                <Box className="access-header">
                    <h3 className="title drop-shadow">
                        Enter your access code
                    </h3>
                    <p className="subtitle drop-shadow">
                        Private space. Just for the boys.
                    </p>
                </Box>

                {showKeypad ? (
                    <Box
                        className={`mobile-passcode-shell ${isError ? "shake" : ""}`}
                    >
                        <Box
                            className="mobile-code-dots"
                            role="group"
                            aria-label={`Access code entry. ${filledDigits} of ${CODE_LENGTH} digits entered.`}
                        >
                            {code.map((digit, index) => (
                                <span
                                    key={index}
                                    className={`mobile-code-dot ${
                                        digit ? "filled" : ""
                                    } ${isError ? "error" : ""}`}
                                    aria-hidden="true"
                                />
                            ))}
                        </Box>

                        <Box
                            className="mobile-keypad"
                            aria-label="Numeric keypad"
                        >
                            {MOBILE_KEYPAD_ROWS.flat().map((button) => (
                                <button
                                    key={button.digit}
                                    type="button"
                                    className="mobile-keypad-button"
                                    onClick={() =>
                                        handleDigitPress(button.digit)
                                    }
                                    disabled={isInputDisabled}
                                    aria-label={`Enter ${button.digit}`}
                                >
                                    <span className="mobile-keypad-digit">
                                        {button.digit}
                                    </span>
                                    {button.letters ? (
                                        <span className="mobile-keypad-letters">
                                            {button.letters}
                                        </span>
                                    ) : (
                                        <span className="mobile-keypad-letters mobile-keypad-letters-empty">
                                            &nbsp;
                                        </span>
                                    )}
                                </button>
                            ))}
                        </Box>

                        <Box className="mobile-keypad-bottom-row">
                            <span
                                className="mobile-keypad-bottom-spacer"
                                aria-hidden="true"
                            />

                            <button
                                type="button"
                                className="mobile-keypad-button"
                                onClick={() => handleDigitPress("0")}
                                disabled={isInputDisabled}
                                aria-label="Enter 0"
                            >
                                <span className="mobile-keypad-digit">0</span>
                                <span className="mobile-keypad-letters mobile-keypad-letters-empty">
                                    &nbsp;
                                </span>
                            </button>

                            <button
                                type="button"
                                className="mobile-keypad-button mobile-keypad-delete-button"
                                onClick={handleDeletePress}
                                disabled={isInputDisabled || filledDigits === 0}
                                aria-label="Delete last digit"
                            >
                                <span className="mobile-keypad-delete-icon">
                                    ⌫
                                </span>
                                <span className="mobile-keypad-letters mobile-keypad-delete-label">
                                    Delete
                                </span>
                            </button>
                        </Box>
                    </Box>
                ) : (
                    <Box className={`code-inputs ${isError ? "shake" : ""}`}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(element) => {
                                    inputsRef.current[index] = element;
                                }}
                                className={`code-box ${isError ? "error" : ""}`}
                                value={digit}
                                onChange={(event) => {
                                    handleChange(event.target.value, index);
                                }}
                                onKeyDown={(event) =>
                                    handleKeyDown(event, index)
                                }
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete="off"
                                maxLength={1}
                                disabled={isInputDisabled}
                                aria-label={`Access code digit ${index + 1}`}
                            />
                        ))}
                    </Box>
                )}

                {isLockedOut ? (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 2,
                            mx: "auto",
                            width: "100%",
                            maxWidth: "28rem",
                            borderRadius: "16px",
                            textAlign: "left",
                            backgroundColor: "rgba(70, 10, 10, 0.9)",
                            color: "#fff",
                            border: "1px solid rgba(255, 120, 120, 0.25)",
                            "& .MuiAlert-icon": {
                                color: "#ffb4b4",
                            },
                        }}
                    >
                        {statusMessage ||
                            "Too many incorrect access code attempts."}{" "}
                        Try again in{" "}
                        {formatLockoutCountdown(remainingLockoutMs)}.
                    </Alert>
                ) : statusMessage ? (
                    <p className="attempts-feedback drop-shadow">
                        {statusMessage}
                    </p>
                ) : null}
            </Box>
        </Box>
    );
};

export default Access;
