import type { CSSProperties } from "react";
import { teams } from "./team-data";
import type { Team } from "../../../interfaces";

type TeamTileStyle = CSSProperties & {
    "--team-color": string;
    "--team-color-rgb": string;
    "--logo-scale": string;
};

const NHLTeamGrid = ({
    selectedTeam,
    onChange,
    isVisible,
}: {
    selectedTeam: Team | null;
    onChange: (teamId: Team) => void;
    isVisible?: boolean;
}) => {
    return teams.map((team, index) => {
        const isSelected = selectedTeam?.id === team.id;

        return (
            <button
                key={team.id}
                className={`team-tile ${isVisible ? "show" : ""} ${isSelected ? "selected" : ""}`}
                onClick={() => onChange(team)}
                data-testid={`team-tile-${team.abbrev}`}
                style={
                    {
                        animationDelay: `${index * 40}ms`,
                        "--team-color": team.primaryColor,
                        "--team-color-rgb": team.primaryColorRgb,
                        "--logo-scale": String(team.selectionLogoScale ?? 1.5),
                    } as TeamTileStyle
                }
            >
                <img src={team.logo} alt={team.name} />
            </button>
        );
    });
};

export default NHLTeamGrid;
