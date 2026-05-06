import { Button, Stack } from "@mui/material";
import { keyframes, styled } from "@mui/material/styles";
import { LIVE_RED, liveOutlinedActionButtonStyles } from "./gameCardStyles";

const glowPulse = keyframes`
  0% {
    box-shadow:
      0 0 2px rgba(255, 0, 0, 0.6),
      0 0 4px rgba(255, 0, 0, 0.5),
      0 0 6px rgba(255, 0, 0, 0.4);
  }
  50% {
    box-shadow:
      0 0 4px rgba(255, 0, 0, 0.8),
      0 0 8px rgba(255, 0, 0, 0.7),
      0 0 12px rgba(255, 0, 0, 0.6);
  }
  100% {
    box-shadow:
      0 0 2px rgba(255, 0, 0, 0.6),
      0 0 4px rgba(255, 0, 0, 0.5),
      0 0 6px rgba(255, 0, 0, 0.4);
  }
`;

const GlowButton = styled(Button)(() => ({
    color: "#fff",
    backgroundColor: LIVE_RED,
    position: "relative",
    animation: `${glowPulse} 1.5s ease-in-out infinite`,
    transition: "all 0.2s ease",
    "&:hover": {
        transform: "scale(1.015)",
    },
}));

type LiveGameCardActionsProps = {
    editing: boolean;
    isAdmin: boolean;
    isSaving: boolean;
    isSelected: boolean;
    isSelectionLocked: boolean;
    hasStreamUrl: boolean;
    showMultiViewAction: boolean;
    gameId: number;
    gameCenterLink?: string;
    onOpenGame: (gameId: number) => void;
    onToggleMultiView?: (gameId: number) => void;
    onStartEditing: () => void;
    onSave: () => void;
};

const LiveGameCardActions = ({
    editing,
    isAdmin,
    isSaving,
    isSelected,
    isSelectionLocked,
    hasStreamUrl,
    showMultiViewAction,
    gameId,
    gameCenterLink,
    onOpenGame,
    onToggleMultiView,
    onStartEditing,
    onSave,
}: LiveGameCardActionsProps) => {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: "center",
                justifyContent: "space-between",
                mt: editing ? 1 : 2,
            }}
        >
            {!editing ? (
                <>
                    {isAdmin && !isSelected && (
                        <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            sx={liveOutlinedActionButtonStyles}
                            onClick={onStartEditing}
                        >
                            Edit
                        </Button>
                    )}
                    {showMultiViewAction && hasStreamUrl && (
                        <Button
                            fullWidth
                            size="small"
                            onClick={(event) => {
                                event.stopPropagation();
                                if (onToggleMultiView)
                                    onToggleMultiView(gameId);
                            }}
                            disabled={isSelectionLocked}
                            variant="outlined"
                            sx={{
                                display: { xs: "none", lg: "flex" },
                                ...liveOutlinedActionButtonStyles,
                                background: isSelected ? LIVE_RED : "unset",
                                color: isSelected ? "#fff" : LIVE_RED,
                                ...(isSelected && {
                                    "&:hover": {
                                        background: LIVE_RED,
                                    },
                                }),
                            }}
                        >
                            {isSelected
                                ? "Remove"
                                : isSelectionLocked
                                  ? "Max 4"
                                  : "Multiview"}
                        </Button>
                    )}
                    {!hasStreamUrl && gameCenterLink && (
                        <Button
                            fullWidth
                            size="small"
                            target="_blank"
                            rel="noreferrer"
                            variant="outlined"
                            sx={liveOutlinedActionButtonStyles}
                            href={`https://www.nhl.com${gameCenterLink}`}
                        >
                            Gamecenter
                        </Button>
                    )}
                    {!isSelected && hasStreamUrl && (
                        <GlowButton
                            fullWidth
                            size="small"
                            variant="contained"
                            sx={{
                                color: "#fff",
                            }}
                            onClick={() => onOpenGame(gameId)}
                        >
                            Watch
                        </GlowButton>
                    )}
                </>
            ) : (
                <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    disabled={isSaving}
                    sx={liveOutlinedActionButtonStyles}
                    onClick={onSave}
                >
                    {isSaving ? "Saving..." : "Save"}
                </Button>
            )}
        </Stack>
    );
};

export default LiveGameCardActions;
