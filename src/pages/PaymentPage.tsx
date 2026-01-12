import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, Lock, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MockDB } from '../lib/mockDb';

export function PaymentPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);
    const [notified, setNotified] = useState(false);

    // DADOS DO PIX (Configuráveis)
    const PIX_KEY = "viciowins@gmail.com";
    const APP_PRICE = "15,00";

    const handleCopyPix = () => {
        navigator.clipboard.writeText(PIX_KEY);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNotifyPayment = () => {
        // Here we would ideally update the DB status to 'pending_approval'
        // For now, in our Mock setup, we'll simulate sending a message
        setNotified(true);

        // Update local mock user status
        if (user) {
            MockDB.updateUserStatus(user.id, 'pending');
        }

        // Redirect to WhatsApp with pre-filled message
        const message = `Olá! Acabei de fazer o PIX de R$ ${APP_PRICE} para liberar meu acesso no App Jacaré do Corte. Meu email é: ${user?.email}`;
        const whatsappLink = `https://wa.me/554199904961?text=${encodeURIComponent(message)}`;

        // Open WhatsApp in new tab
        window.open(whatsappLink, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#2E5C38] flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative z-10 text-center animate-in fade-in zoom-in duration-500">

                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D4AF37]">
                    <Lock size={40} className="stroke-[2px]" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Libere seu Acesso</h1>
                <p className="text-gray-500 mb-6 leading-relaxed">
                    Para agendar cortes e acessar recursos exclusivos, adquira sua licença vitalícia do aplicativo.
                </p>

                <div className="bg-green-50 rounded-2xl p-6 mb-6 border border-green-100">
                    <p className="text-sm text-[#2E5C38] font-bold uppercase tracking-wider mb-1">Valor Único</p>
                    <p className="text-4xl font-black text-[#2E5C38]">R$ {APP_PRICE}</p>
                    <p className="text-xs text-green-600 mt-2 font-medium">Sem mensalidades. Pague uma vez, use para sempre.</p>
                </div>

                {/* PIX Area */}
                <div className="space-y-4 mb-8">
                    <div className="text-left bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Chave PIX (E-mail)</p>
                        <p className="text-gray-900 font-mono font-bold text-lg">{PIX_KEY}</p>

                        <button
                            onClick={handleCopyPix}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-[#2E5C38]"
                        >
                            {copied ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                        </button>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleNotifyPayment}
                    disabled={notified}
                    className="w-full bg-[#2E5C38] text-white font-bold h-14 rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-[#1E3F24] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {notified ? (
                        <>
                            <CheckCircle size={20} />
                            Aguardando Liberação...
                        </>
                    ) : (
                        <>
                            <MessageCircle size={20} />
                            Enviar Comprovante
                        </>
                    )}
                </button>

                <p className="text-xs text-gray-400 mt-4 px-4">
                    Após o envio, seu acesso será liberado pelo administrador em instantes.
                </p>
            </div>

            <button
                onClick={() => navigate('/login')}
                className="mt-8 text-white/50 text-sm font-bold hover:text-white transition-colors"
            >
                Sair e tentar depois
            </button>
        </div>
    );
}
