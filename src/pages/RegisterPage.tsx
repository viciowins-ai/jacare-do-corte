import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { AuthLayout } from '../layouts';
import { supabase } from '../lib/supabase';

export function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone,
                    },
                },
            });

            if (error) throw error;

            if (data.session) {
                navigate('/home');
            } else {
                // Se não houver sessão, significa que o email precisa de confirmação
                // Navega para a tela de OTP passando o email
                navigate('/verify-otp', { state: { email } });
            }

        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="flex flex-col h-screen bg-[#F5F5F7]">
                {/* Green Header Section - Takes up top portion */}
                <div className="bg-[#2E5C38] pt-12 px-6 flex flex-col items-center relative shrink-0 pb-16">
                    <div className="w-full flex items-center mb-6 relative">
                        <Link to="/login" className="text-white absolute left-0 p-1">
                            <ArrowLeft size={28} />
                        </Link>
                        <h1 className="text-white text-xl font-bold w-full text-center">Criar Conta</h1>
                    </div>

                    <div className="w-28 h-28 bg-black rounded-full border-[2px] border-[#D4AF37] flex items-center justify-center overflow-hidden shadow-2xl relative z-10 mb-4">
                        <img src="/logo_jacare.jpg" alt="Jacaré do Corte" className="w-full h-full object-cover scale-110" />
                    </div>
                </div>

                {/* White Content Section - Rounded Top moving up */}
                <div className="flex-1 bg-white rounded-t-[30px] -mt-8 flex flex-col px-8 pt-10 pb-6 shadow-[-4px_-4px_10px_rgba(0,0,0,0.05)] overflow-y-auto">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 w-full text-center border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="w-full space-y-4">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Nome Completo"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-white border border-gray-300 rounded-xl text-base outline-none focus:border-[#2E5C38] focus:ring-1 focus:ring-[#2E5C38] text-gray-800 placeholder-gray-500 shadow-sm"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-white border border-gray-300 rounded-xl text-base outline-none focus:border-[#2E5C38] focus:ring-1 focus:ring-[#2E5C38] text-gray-800 placeholder-gray-500 shadow-sm"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                <Phone size={20} />
                            </div>
                            <input
                                type="tel"
                                placeholder="Celular"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-white border border-gray-300 rounded-xl text-base outline-none focus:border-[#2E5C38] focus:ring-1 focus:ring-[#2E5C38] text-gray-800 placeholder-gray-500 shadow-sm"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                placeholder="Senha"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-white border border-gray-300 rounded-xl text-base outline-none focus:border-[#2E5C38] focus:ring-1 focus:ring-[#2E5C38] text-gray-800 placeholder-gray-500 shadow-sm"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                placeholder="Confirmar Senha"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-white border border-gray-300 rounded-xl text-base outline-none focus:border-[#2E5C38] focus:ring-1 focus:ring-[#2E5C38] text-gray-800 placeholder-gray-500 shadow-sm"
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-[#3E6D48] text-white font-bold text-lg rounded-xl shadow-lg hover:bg-[#2E5C38] active:scale-95 transition-all flex items-center justify-center"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Finalizar Cadastro'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-auto pt-6 pb-2 text-center">
                        <span className="text-gray-900 font-medium text-sm">Já tem conta? </span>
                        <Link to="/login" className="text-[#D4AF37] font-bold text-sm hover:underline ml-1">Entrar</Link>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
