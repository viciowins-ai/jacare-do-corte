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

    // --- TRAVA DE PAGAMENTO REMOVIDA (FREEMIUM) ---
    // O usuário pode acessar o app, mas será bloqueado em ações específicas (ex: Agendar)

    // If user IS approved but tries to go to /payment, maybe redirect home? 
    // Optional, but let's keep it simple.

    return <>{children}</>;
}
