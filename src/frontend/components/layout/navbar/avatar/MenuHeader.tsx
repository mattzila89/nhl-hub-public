import { ArrowBack } from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/material";

const MenuHeader = ({
    title,
    onBack,
}: {
    title: string;
    onBack: () => void;
}) => (
    <Stack direction="row" sx={{ alignItems: "center" }} spacing={0}>
        <IconButton onClick={onBack} size="small">
            <ArrowBack sx={{ color: "white" }} />
        </IconButton>

        <Typography
            sx={{
                color: "white",
                fontWeight: 600,
                fontSize: "1.1rem",
                mt: "3px",
                ml: 1,
            }}
        >
            {title}
        </Typography>
    </Stack>
);

export default MenuHeader;
