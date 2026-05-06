import { useEffect, useState } from "react";
import { teams } from "./team-data";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthProvider";
import type { Team as TeamType, User } from "../../../interfaces";
import "./team.css";
import NHLTeamGrid from "./NHLTeamGrid";
import { Box, Button, Typography } from "@mui/material";
import UserService from "../../services/UserService";

const SelectTeam = () => {
    const { user, setTeam } = useAuth();
    const navigate = useNavigate();
    const [selectedTeam, setSelectedTeam] = useState<TeamType | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Services
    const selectTeam = UserService.useSelectTeam();

    const handleContinue = async () => {
        const goHome = () => navigate("/home");
        if (!selectedTeam) {
            goHome();
        } else {
            try {
                await selectTeam.mutateAsync(selectedTeam).then(() => {
                    // Update user session info
                    setTeam({
                        ...user,
                        selected_team: selectedTeam,
                    } as User);

                    // 👉 redirect after success
                    goHome();
                });
            } catch (err) {
                console.error("Failed to save team", err);
            }
        }
    };

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100); // slight delay feels smoother
    }, []);

    return (
        <Box className={`team-overlay ${isVisible ? "visible" : ""}`}>
            <Typography variant="h5" className="espn-font">
                Who’s your team? (optional)
            </Typography>

            <Box className="team-grid">
                <NHLTeamGrid
                    selectedTeam={selectedTeam}
                    isVisible={isVisible}
                    onChange={(teamId) => setSelectedTeam(teamId)}
                />
            </Box>

            <Button
                className={`continue-btn ${isVisible ? "show" : ""}`}
                style={{ animationDelay: `${300 + teams.length * 40}ms` }}
                fullWidth
                sx={{ color: "#fff" }}
                onClick={() => {
                    void handleContinue();
                }}
                data-testid="select-team-continue"
            >
                Continue
            </Button>
        </Box>
    );
};

export default SelectTeam;
