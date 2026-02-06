
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function RequireProfileCompletion({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="text-[#2E5C38] animate-spin" size={40} /></div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check for phone number in metadata (where we save it) or root phone (if native auth)
    const hasPhone = user.user_metadata?.phone || user.phone;

    if (!hasPhone) {
        // Redirect to complete register page
        return <Navigate to="/complete-register" replace />;
    }

    return <>{children}</>;
}
