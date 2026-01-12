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

    // --- PAYMENT CHECK ---
    // Check if user is approved. Admin (assuming specific email) bypasses.
    const isAdmin = user?.email === 'admin@jacare.com' || user?.email === 'dono@jacare.com';

    // In a real app, this status would come from 'user' metadata or a profile table join.
    // Here we read from our local mock.
    const status = MockDB.getUserStatus(user!.id);

    // If user is NOT admin AND status is 'pending', force them to /payment
    // NOTE: We need to allow access to /payment itself, otherwise infinite loop.
    // The trick is: ProtectedRoute wraps everything. /payment is NOT wrapped by ProtectedRoute in App.tsx?
    // Wait, /payment IS protected or Public? 
    // Ideally /payment should be accessible to logged in users only, so it should be Protected.
    // BUT we can't redirect TO /payment FROM /payment.

    // Let's assume this component wraps pages like /home, /agendar.
    // If the current URL is NOT /payment, we redirect.
    const isPaymentPage = window.location.hash.includes('/payment');

    if (!isAdmin && status !== 'approved' && !isPaymentPage) {
        return <Navigate to="/payment" replace />;
    }

    // If user IS approved but tries to go to /payment, maybe redirect home? 
    // Optional, but let's keep it simple.

    return <>{children}</>;
}
