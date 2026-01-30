import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import { MockDB } from '../lib/mockDb';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, loading, user } = useAuth();

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-primary"><Loader2 className="text-secondary animate-spin" size={40} /></div>;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // --- TRAVA DE PAGAMENTO ATIVA (VENDA DIRETA) ---
    const isAdmin = user?.email === 'admin@jacare.com' || user?.email === 'dono@jacare.com' || user?.email === 'araucariainforma@gmail.com' || user?.email === 'viciowins@gmail.com';
    const isVisitor = user?.email === 'visitante_v5@jacare.com';

    const status = MockDB.getUserStatus(user!.id);
    const isPaymentPage = window.location.hash.includes('/payment');

    // Allow Admin OR Visitor OR Approved User
    if (!isAdmin && !isVisitor && status !== 'approved' && !isPaymentPage) {
        return <Navigate to="/payment" replace />;
    }

    // If user IS approved but tries to go to /payment, maybe redirect home? 
    // Optional, but let's keep it simple.

    return <>{children}</>;
}
