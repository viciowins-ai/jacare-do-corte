import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { AuthLayout } from '../layouts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { session } = useAuth();

    if (session) {
        navigate('/home');
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const isEmail = email.includes('@');
            let res;

            if (isEmail) {
                res = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
            } else {
                // Format Phone to E.164
                let formattedPhone = email.replace(/\D/g, '');
                if (formattedPhone.length === 10 || formattedPhone.length === 11) {
                    formattedPhone = '55' + formattedPhone;
                }
                if (!formattedPhone.startsWith('+')) {
                    formattedPhone = '+' + formattedPhone;
                }

                res = await supabase.auth.signInWithPassword({
                    phone: formattedPhone,
                    password,
                });
            }

            const { error } = res;
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
            {/* Top Header Section */}
            <div className="bg-[#2E5C38] pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg flex flex-col items-center relative z-10">
                <div className="w-full flex justify-center mb-2">
                    <span className="text-white text-lg font-bold">Login</span>
                </div>

                <div className="w-32 h-32 bg-black rounded-full border-[3px] border-[#D4AF37] flex items-center justify-center overflow-hidden mb-4 shadow-xl">
                    <img src="/logo_jacare.jpg" alt="Jacaré do Corte" className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center px-8 pt-8 bg-[#F5F5F7]">
                <h2 className="text-xl font-bold text-gray-800 mb-1">Seu estilo, no seu tempo.</h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 w-full text-center border border-red-200 mt-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="w-full space-y-4 mt-8">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            placeholder="E-mail ou CPF"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2E5C38] focus:ring-1 focus:ring-[#2E5C38] transition-all shadow-sm text-gray-700"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2E5C38] focus:ring-1 focus:ring-[#2E5C38] transition-all shadow-sm text-gray-700"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-[#2E5C38] text-white font-bold rounded-xl shadow-md hover:bg-[#1E3F24] active:scale-95 transition-all flex items-center justify-center text-base mt-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <span className="text-gray-600 text-sm">Não tem conta? </span>
                    <Link to="/register" className="text-[#D4AF37] font-bold text-sm hover:underline">Cadastre-se</Link>
                </div>
            </div>
        </AuthLayout>
    );
}
