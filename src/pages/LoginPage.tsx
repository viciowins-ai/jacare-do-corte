import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { User as UserIcon, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AuthLayout } from '../layouts';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { session } = useAuth();

    // Redirect if already logged in
    if (session) {
        return <Navigate to="/home" replace />;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/home');
        } catch (err: any) {
            setError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="flex flex-col h-screen bg-gray-50">
                {/* Upper Green Section */}
                <div className="bg-primary h-[35vh] w-full flex items-center justify-center relative rounded-b-[40px] shadow-lg">
                    <div className="absolute -bottom-16 w-32 h-32 bg-black rounded-full border-[3px] border-secondary flex items-center justify-center shadow-xl overflow-hidden z-10">
                        <img src="/logo_jacare.jpg" alt="Jacaré do Corte" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Lower White Section */}
                <div className="flex-1 flex flex-col items-center pt-20 px-8 pb-8">
                    <h2 className="text-xl font-bold text-text mb-1">Jacaré do Corte</h2>
                    <p className="text-text-muted text-sm mb-6 font-medium">Seu estilo, no seu tempo.</p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 w-full text-center border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="w-full space-y-5 max-w-sm">
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="password"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-light active:scale-95 transition-all flex items-center justify-center uppercase tracking-wide text-sm mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                        </button>

                        <div className="text-center pt-6">
                            <span className="text-gray-500 text-sm">Não tem conta? </span>
                            <Link to="/register" className="text-secondary-dark font-bold text-sm hover:underline">Cadastre-se</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
}
