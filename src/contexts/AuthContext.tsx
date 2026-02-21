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
            setUser(session?.user ?? null);
            setLoading(false);
            if (session?.user?.email) {
                console.log(`[Auth] Usuário logado: ${session.user.email}`);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // ✅ Novo usuário Google sem telefone → redireciona para completar perfil
            if (event === 'SIGNED_IN' && session?.user) {
                const u = session.user;
                const isGoogle = u.app_metadata?.provider === 'google' || u.identities?.some(i => i.provider === 'google');
                const hasPhone = u.phone || u.user_metadata?.phone;

                if (isGoogle && !hasPhone) {
                    // Use a small timeout to let the router mount before redirecting
                    setTimeout(() => {
                        // Only redirect if not already on complete-register
                        if (!window.location.hash.includes('complete-register')) {
                            window.location.hash = '#/complete-register';
                        }
                    }, 300);
                }
            }
        });

        // Demo Mode Handler
        const checkDemo = () => {
            const isDemo = localStorage.getItem('demo_mode') === 'true';
            if (isDemo && !session) {
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
        setSession(null);
        setUser(null);
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
