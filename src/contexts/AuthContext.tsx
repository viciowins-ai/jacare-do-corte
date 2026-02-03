
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
        // Check active sessions
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null); // Keep setUser here to initialize user state
            setLoading(false);
            if (session?.user?.email) {
                console.log(`[Auth] Usuário logado: ${session.user.email}`);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null); // Keep setUser here to update user state on auth change
            setLoading(false);
        });

        // Demo Mode Handler
        const checkDemo = () => {
            const isDemo = localStorage.getItem('demo_mode') === 'true';
            // Use the current session state from the closure or ensure it's updated
            // For `checkDemo` to react to `session` changes, it needs to be inside the effect or `session` in deps
            // Given the instruction, we'll keep it as is, but note the potential for stale `session` in `checkDemo` if `session` isn't in deps.
            // However, `onAuthStateChange` and `getSession` handle the primary auth state.
            if (isDemo && !session) { // This `session` refers to the state at the time of effect run
                const demoUser: any = {
                    id: 'visitante-novo-v5',
                    email: 'visitante_v5@jacare.com',
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
