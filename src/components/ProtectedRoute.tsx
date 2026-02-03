import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';


export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-primary"><Loader2 className="text-secondary animate-spin" size={40} /></div>;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // --- PERMISSION CHECK ---
    // Aqui podemos implementar a lógica fina de permissões
    // const role = await getUserRole(session.user.email);
    // if (role === 'admin' && session_count > 1) { logout() } -> Futura implementação via Realtime

    return <>{children}</>;
}
