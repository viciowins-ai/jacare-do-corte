
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Demo Mode Handler
        const checkDemo = () => {
            const isDemo = localStorage.getItem('demo_mode') === 'true';
            if (isDemo && !session) {
                const demoUser: any = {
                    id: 'demo-user-123',
                    email: 'visitante@jacare.com',
                    user_metadata: { full_name: 'Visitante', avatar_url: null }
                };
                setUser(demoUser);
                setSession({ user: demoUser } as any);
                setLoading(false);
            }
        };
        checkDemo();
        window.addEventListener('storage', checkDemo);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('storage', checkDemo);
        };
    }, []);

    const signOut = async () => {
        localStorage.removeItem('demo_mode');
        // Force reload to clear context state effectively if relying on internal state
        if (localStorage.getItem('demo_mode') === null) {
            setSession(null);
            setUser(null);
        }
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
