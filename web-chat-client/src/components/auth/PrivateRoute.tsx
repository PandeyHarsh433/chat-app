import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import React from "react";

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
};
