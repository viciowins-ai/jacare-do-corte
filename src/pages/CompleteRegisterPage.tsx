
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function CompleteRegisterPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if already has phone (unless we are editing)
    useEffect(() => {
        if (user && !location.state?.editing) {
            const hasPhone = user.phone || user.user_metadata?.phone;
            if (hasPhone) {
                navigate('/home', { replace: true });
            }
        }
    }, [user, navigate, location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Format Phone
            let formattedPhone = phone.replace(/\D/g, '');
            // Basic validation
            if (formattedPhone.length < 10) {
                throw new Error('Número de telefone inválido.');
            }

            // Add +55 if missing (assuming BR for now as per previous logic)
            if (formattedPhone.length === 10 || formattedPhone.length === 11) {
                formattedPhone = '55' + formattedPhone;
            }
            // Add + if missing
            if (!formattedPhone.startsWith('+')) {
                formattedPhone = '+' + formattedPhone;
            }

            console.log('Atualizando telefone para:', formattedPhone);

            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { phone: formattedPhone } // Save in metadata as 'phone'
            });

            if (updateError) throw updateError;

            // Update successful, redirect home
            navigate('/home', { replace: true });

        } catch (err: any) {
            console.error('Erro ao salvar telefone:', err);
            setError(err.message || 'Erro ao salvar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#F5F5F7] items-center justify-center px-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">

                <div className="w-20 h-20 bg-[#2E5C38] rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg text-white">
                    <Phone size={32} />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Quase lá!</h1>
                <p className="text-gray-500 mb-8">
                    Para agendar horários, precisamos do seu WhatsApp para enviar confirmações.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group text-left">
                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase mb-1 block">Celular / WhatsApp</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Phone size={20} />
                            </div>
                            <input
                                type="tel"
                                placeholder="(00) 00000-0000"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-lg outline-none focus:border-[#2E5C38] focus:ring-1 focus:ring-[#2E5C38] text-gray-800 placeholder-gray-400 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-[#3E6D48] text-white font-bold text-lg rounded-xl shadow-lg hover:bg-[#2E5C38] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                <span>Concluir</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
