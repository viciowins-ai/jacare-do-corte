import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Lock, Mail, Phone, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthLayout } from '../layouts';

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
                navigate('/login');
                alert('Cadastro realizado! Por favor, faça login.');
            }

        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            {/* Header for Auth Page */}
            <div className="bg-primary p-4 text-white flex items-center gap-4">
                <Link to="/login"><ChevronRight className="rotate-180" /></Link>
                <h1 className="font-bold text-lg">Criar Conta</h1>
            </div>

            <div className="flex-1 flex flex-col items-center p-6 bg-gray-50 overflow-y-auto">
                <div className="w-24 h-24 bg-black rounded-full mb-6 flex items-center justify-center border-[3px] border-secondary shadow-lg overflow-hidden">
                    <img src="/logo_jacare.jpg" alt="Jacaré do Corte" className="w-full h-full object-cover" />
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 w-full text-center border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="w-full space-y-4">
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input type="text" placeholder="Nome Completo" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field pl-12" required />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-12" required />
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input type="tel" placeholder="Celular" value={phone} onChange={e => setPhone(e.target.value)} className="input-field pl-12" required />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-12" required />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input type="password" placeholder="Confirmar Senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field pl-12" required />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full shadow-lg mt-6 flex items-center justify-center text-center disabled:opacity-70">
                        {loading ? <Loader2 className="animate-spin" /> : 'Finalizar Cadastro'}
                    </button>

                    <div className="text-center pt-4 pb-8">
                        <span className="text-text-muted">Já tem conta? </span>
                        <Link to="/login" className="text-secondary-dark font-semibold hover:underline">Entrar</Link>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
