import { Navigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";
import LoadingNHLText from "../components/loading/LoadingNHLText";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) return <LoadingNHLText />;

    if (isAuthenticated) {
        // 👇 route based on setup state
        if (user?.selected_team == null) {
            return <Navigate to="/select-team" />;
        }

        return <Navigate to="/home" />;
    }

    return children;
};

export default PublicRoute;
