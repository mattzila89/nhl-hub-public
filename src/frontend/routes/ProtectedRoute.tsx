import { Navigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";
import type React from "react";
import LoadingNHLText from "../components/loading/LoadingNHLText";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingNHLText />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
