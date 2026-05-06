import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

type MultiViewSelectionBarProps = {
    selectionCount: number;
    canOpenMultiView: boolean;
    minimumSelectionsRemaining: number;
    onOpen: () => void;
    onCancel: () => void;
};

const MultiViewSelectionBar = ({
    selectionCount,
    canOpenMultiView,
    minimumSelectionsRemaining,
    onOpen,
    onCancel,
}: MultiViewSelectionBarProps) => {
    return (
        <Paper
            elevation={0}
            sx={{
                mb: 2,
                px: 2,
                py: 1.5,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: {
                    xs: "flex-start",
                    sm: "center",
                },
                justifyContent: "space-between",
                gap: 1.5,
                borderRadius: 1,
                backgroundColor: alpha("#070707", 0.42),
                backdropFilter: "blur(5px)",
            }}
        >
            <Box>
                <Typography sx={{ fontWeight: 800 }}>
                    Multiview Selection Active
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ color: alpha("#ffffff", 0.78) }}
                >
                    {canOpenMultiView
                        ? `Ready to open ${selectionCount}-game multiview. You can select up to four games total.`
                        : `Select ${minimumSelectionsRemaining} more ${minimumSelectionsRemaining === 1 ? "game" : "games"} to enable multiview.`}
                </Typography>
            </Box>

            <Stack
                direction="row"
                spacing={1}
                sx={{ width: { xs: "100%", sm: "auto" } }}
            >
                <Button
                    variant="contained"
                    disabled={!canOpenMultiView}
                    onClick={onOpen}
                    sx={{
                        minWidth: 112,
                        backgroundColor: "#b22234",
                        "&:hover": {
                            backgroundColor: "#951b2b",
                        },
                        "&.Mui-disabled": {
                            color: alpha("#ffffff", 0.54),
                            backgroundColor: alpha("#ffffff", 0.14),
                        },
                    }}
                >
                    Open
                </Button>

                <Button
                    variant="outlined"
                    onClick={onCancel}
                    sx={{
                        borderColor: alpha("#ffffff", 0.26),
                        "&:hover": {
                            borderColor: alpha("#ffffff", 0.42),
                            backgroundColor: alpha("#ffffff", 0.08),
                        },
                    }}
                >
                    Cancel
                </Button>
            </Stack>
        </Paper>
    );
};

export default MultiViewSelectionBar;
