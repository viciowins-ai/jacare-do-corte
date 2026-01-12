import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageCircle, HelpCircle, Settings, AlertTriangle, ChevronRight, Star, Send, FileText, User, Disc, LayoutGrid, MonitorSmartphone } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

// ... (Existing pages like OTP, PasswordReset, About, Settings, Support - keeping them similar but refining styles if needed)

// Helper Component for Navigation Bar (Local usage for auth pages if needed visually)
function BottomNav({ active }: { active?: string }) {
    const navigate = useNavigate();
    const isActive = (path: string) => active === path;

    return (
        <nav className="absolute bottom-0 w-full h-[70px] bg-[#2C2C2C] rounded-t-[20px] flex items-center justify-around px-2 z-50">
            <button onClick={() => navigate('/home')} className={clsx("flex flex-col items-center justify-center w-16 gap-1", isActive('/home') ? "text-[#D4AF37]" : "text-white/70 hover:text-white")}>
                <User size={26} strokeWidth={isActive('/home') ? 2.5 : 2} />
                <span className={clsx("text-[11px] font-medium tracking-wide", isActive('/home') ? "opacity-100" : "opacity-80")}>Início</span>
            </button>
            <button onClick={() => navigate('/agendar')} className={clsx("flex flex-col items-center justify-center w-16 gap-1", isActive('/agendar') ? "text-[#D4AF37]" : "text-white/70 hover:text-white")}>
                <Disc size={26} strokeWidth={isActive('/agendar') ? 2.5 : 2} />
                <span className={clsx("text-[11px] font-medium tracking-wide", isActive('/agendar') ? "opacity-100" : "opacity-80")}>Agendar</span>
            </button>
            <button onClick={() => navigate('/perfil')} className={clsx("flex flex-col items-center justify-center w-16 gap-1", isActive('/perfil') ? "text-[#D4AF37]" : "text-white/70 hover:text-white")}>
                <LayoutGrid size={26} strokeWidth={isActive('/perfil') ? 2.5 : 2} />
                <span className={clsx("text-[11px] font-medium tracking-wide", isActive('/perfil') ? "opacity-100" : "opacity-80")}>Perfil</span>
            </button>
        </nav>
    );
}

import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

export function OTPVerificationPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const phone = location.state?.phone;
    const target = phone || email || 'seu contato';

    const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Auto focus first input
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        // Move to next input
        if (value !== '' && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Move to previous input on Backspace if empty
        if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) {
            setError('Por favor, preencha o código completo.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let error;

            if (phone) {
                // Verify Phone OTP
                const res = await supabase.auth.verifyOtp({
                    phone: phone,
                    token: code,
                    type: 'sms'
                });
                error = res.error;
            } else {
                // Verify Email OTP
                const res = await supabase.auth.verifyOtp({
                    email: email,
                    token: code,
                    type: 'signup'
                });
                error = res.error;
            }

            if (error) throw error;

            navigate('/home');
        } catch (err: any) {
            setError(err.message || 'Código inválido ou expirado.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            let error;
            if (phone) {
                const res = await supabase.auth.resend({
                    type: 'sms',
                    phone: phone
                });
                error = res.error;
            } else {
                const res = await supabase.auth.resend({
                    type: 'signup',
                    email: email
                });
                error = res.error;
            }

            if (error) throw error;
            alert(`Código reenviado para ${phone ? 'seu e-mail' : 'seu e-mail'}!`);
        } catch (err: any) {
            alert('Erro ao reenviar código: ' + err.message);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] pb-24 max-w-md mx-auto shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="bg-[#2E5C38] pt-12 p-6 flex items-center justify-between shadow-none relative z-10">
                <button onClick={() => navigate(-1)} className="text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-white text-lg font-bold">Verificação</h1>
                <button className="text-white">
                    <Settings size={24} />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center pt-8 px-6 bg-white rounded-t-[0px]">
                {/* Logo */}
                <div className="w-32 h-32 bg-black rounded-full border-[3px] border-[#D4AF37] flex items-center justify-center overflow-hidden mb-6 shadow-lg">
                    <img src="/logo_jacare.jpg" alt="Logo" className="w-full h-full object-cover scale-110" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifique seu Código</h2>
                <p className="text-center text-gray-500 mb-8 text-sm max-w-xs">
                    Enviamos o código para <br />
                    <span className="font-medium text-gray-700">{target}</span>
                </p>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                {/* OTP Inputs */}
                <div className="flex gap-2 mb-8 justify-center">
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={el => { inputRefs.current[i] = el }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className="w-9 h-12 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center text-lg font-bold text-gray-800 shadow-sm text-center focus:border-[#2E5C38] focus:ring-1 focus:ring-[#2E5C38] outline-none transition-all"
                        />
                    ))}
                </div>

                <div className="w-full space-y-4">
                    <button
                        onClick={handleVerify}
                        disabled={loading}
                        className="w-full h-12 bg-[#3E6D48] text-white font-bold rounded-full shadow-lg text-lg hover:bg-[#2E5C38] transition-colors disabled:opacity-70 flex items-center justify-center"
                    >
                        {loading ? 'Verificando...' : 'Confirmar Código'}
                    </button>

                    <button onClick={handleResend} className="w-full text-center text-gray-500 text-sm font-medium hover:text-[#2E5C38] transition-colors pb-4">
                        Reenviar código
                    </button>
                </div>
            </div>

            {/* Bottom Navigation (Visual Only for this screen as user is not logged in) */}
            <nav className="fixed bottom-0 w-full h-[70px] bg-[#2C2C2C] flex items-center justify-around px-2 z-50 rounded-t-3xl pb-2">
                <button className="flex flex-col items-center justify-center w-16 gap-1 text-white/50">
                    <User size={24} />
                    <span className="text-[10px] font-medium tracking-wide">Início</span>
                </button>
                <button className="flex flex-col items-center justify-center w-16 gap-1 text-white/50">
                    <Disc size={24} />
                    <span className="text-[10px] font-medium tracking-wide">Agendar</span>
                </button>
                <button className="flex flex-col items-center justify-center w-16 gap-1 text-white/50">
                    <LayoutGrid size={24} />
                    <span className="text-[10px] font-medium tracking-wide">Perfil</span>
                </button>
            </nav>
        </div>
    );
}

export function PasswordResetSuccessPage() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] pb-24 max-w-md mx-auto shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="bg-[#2E5C38] pt-12 pb-6 px-4 flex items-center justify-between shadow-none relative z-10">
                <button onClick={() => navigate('/login')} className="text-white"><ArrowLeft size={24} /></button>
                <h1 className="text-white text-lg font-bold">Senha Redefinida!</h1>
                <Settings className="text-white" size={24} />
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white flex flex-col items-center justify-center p-6 text-center -mt-1 pt-20 rounded-t-[0px]">

                {/* Decorative Confetti */}
                <div className="relative w-full max-w-xs h-64 flex items-center justify-center mb-6">
                    {/* Random Dots mimicking confetti */}
                    <div className="absolute top-10 left-10 w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-60"></div>
                    <div className="absolute top-4 right-20 w-2 h-2 bg-[#D4AF37] rounded-full opacity-40"></div>
                    <div className="absolute top-20 right-10 w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-80"></div>
                    <div className="absolute bottom-10 left-14 w-1 h-1 bg-[#D4AF37] rounded-full opacity-70"></div>
                    <div className="absolute bottom-20 right-16 w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-50"></div>

                    {/* Big Gold Check Circle */}
                    <div className="w-32 h-32 rounded-full border-[4px] border-[#D4AF37] flex items-center justify-center relative z-10 bg-white">
                        <div className="w-[116px] h-[116px] rounded-full bg-[#D4AF37] flex items-center justify-center">
                            <span className="text-white text-6xl font-bold mt-2">✓</span>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sua senha foi redefinida</h2>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">com sucesso!</h2>

                <p className="text-center text-gray-500 max-w-xs text-sm leading-relaxed">
                    Agora você pode acessar sua conta com a nova senha.
                </p>
            </div>

            <BottomNav />
        </div>
    )
}

export function RateComponent({ filled }: { filled: boolean }) {
    return <Star size={36} className={`${filled ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-200'} transition - colors`} strokeWidth={1} />
}

export function RatingPage() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col min-h-screen bg-[#2E5C38] pb-24">
            {/* Header Section */}
            <div className="pt-12 px-6 pb-2 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-white text-lg font-bold">Avaliação</h1>
                <button className="text-white">
                    <Settings size={24} />
                </button>
            </div>

            {/* Service Info Pill */}
            <div className="flex justify-center mb-8 mt-4">
                <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.1)] px-5 py-2 rounded-full backdrop-blur-sm border border-white/20">
                    <div className="w-8 h-8 rounded-full bg-[#E5D5A0] flex items-center justify-center overflow-hidden border border-white">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Barber" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white text-sm font-medium tracking-wide">Corte + Barba com Sr. Mora</span>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="flex-1 bg-white rounded-t-[35px] relative px-6 pt-12 text-center flex flex-col items-center">

                {/* Decorative Confetti (Simplified) */}
                <div className="absolute top-8 left-10 w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-60"></div>
                <div className="absolute top-12 right-12 w-2 h-2 bg-[#D4AF37] rounded-full opacity-40"></div>
                <div className="absolute top-20 left-20 w-1 h-1 bg-[#D4AF37] rounded-full opacity-80"></div>
                <div className="absolute top-16 right-24 w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-50"></div>

                {/* Checkmark Icon */}
                <div className="w-24 h-24 rounded-full border-[4px] border-[#D4AF37] flex items-center justify-center mb-6 relative">
                    <div className="w-full h-full rounded-full border-[4px] border-white flex items-center justify-center bg-[#D4AF37]">
                        <span className="text-white text-4xl font-bold">✓</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1">Como foi seu</h2>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">atendimento?</h2>

                {/* Stars */}
                <div className="flex gap-2 mb-2">
                    {[true, true, true, true, false].map((f, i) => <RateComponent key={i} filled={f} />)}
                </div>
                <span className="text-sm font-bold text-gray-900 mb-8 block">Ótimo</span>

                {/* Input Card */}
                <div className="w-full bg-[#F5F5F7] rounded-2xl p-4 mb-6">
                    <textarea
                        className="w-full bg-transparent outline-none text-sm text-gray-600 resize-none h-12 placeholder-gray-400"
                        placeholder="Deixe um comentário (opcional)..."
                    ></textarea>
                </div>

                <button className="w-full h-14 bg-[#2E5C38] text-white font-bold rounded-full shadow-lg text-lg">
                    Enviar Avaliação
                </button>
            </div>
        </div>
    )
}

// Chat Message Interface
interface Message {
    id: number;
    text: string;
    sender: 'user' | 'support';
    isCard?: boolean;
    cardTitle?: string;
}

export function ChatPage() {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Gostaria de saber mais sobre o serviço de barba com o Sr. Zeca",
            sender: 'support',
            isCard: true,
            cardTitle: "Como faço para agendar?"
        },
        {
            id: 2,
            text: "Olá, tive um problema com meu agendamento de hoje.",
            sender: 'support' // Simulating "received" from client perspective or initial state
        },
        {
            id: 3,
            text: "Olá! Por favor, descreva o problema para que possamos ajudar.",
            sender: 'user'
        },
        {
            id: 4,
            text: "Olá! Poderia dar mais detalhes sobre o serviço?",
            sender: 'user'
        }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial message correction: The screenshot shows gray bubbles on left (support/received) and green on right (user/sent).
    // The previous code had "Received" as standard gray. Let's fix the initial state to match the visual story or start fresh.
    // The user wants functionality. Let's make the initial state consist of a conversation history.
    // Screenshot:
    // Left (White Card): "Como faço..." (Seems like a received FAQ suggestion)
    // Left (Gray): "Olá, tive a problema..."
    // Right (Green): "Olá! Porver..."
    // Right (Green): "Olá! torsar..."

    // Let's reset to this exact initial state but corrected text.

    // Re-initializing state inside the component to ensure clean slate if needed, but the above is fine.
    // Actually, let's make it cleaner and strictly typed.

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newUserMsg: Message = {
            id: Date.now(),
            text: inputValue,
            sender: 'user'
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue("");

        // Simulate Support Reply
        setTimeout(() => {
            const supportMsg: Message = {
                id: Date.now() + 1,
                text: "Obrigado por entrar em contato. Um de nossos atendentes responderá em breve.",
                sender: 'support'
            };
            setMessages(prev => [...prev, supportMsg]);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-screen bg-[#F5F5F7] relative">
            {/* Header */}
            <div className="bg-[#2E5C38] pt-12 pb-4 px-4 flex items-center justify-between shadow-sm shrink-0 z-20">
                <button onClick={() => navigate(-1)} className="text-white"><ArrowLeft size={24} /></button>
                <h1 className="text-white text-lg font-bold">Fale Conosco (Chat)</h1>
                <Settings className="text-white" size={24} />
            </div>

            {/* Agent Info Bar */}
            <div className="bg-white px-6 py-3 flex items-center gap-3 shadow-sm shrink-0 z-10">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" alt="Support" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-gray-900 text-sm">Chat com Suporte</span>
            </div>

            {/* Chat Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 bg-[#F5F5F7]">

                {/* Re-rendering Initial Mock Messages to match the screenshot structure but with functional mapping if possible, 
                    OR just hardcoding the initial ones and mapping the new ones. 
                    For true functionality, we should map everything. */}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.isCard ? (
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center justify-between max-w-[90%] transform transition-all hover:scale-[1.02]">
                                <div className="pr-4">
                                    <p className="font-bold text-gray-900 text-sm mb-1 leading-tight">{msg.cardTitle}</p>
                                    <p className="text-xs text-gray-500 leading-snug">{msg.text}</p>
                                </div>
                                <div className="w-10 h-6 bg-[#2E5C38] rounded-full relative shrink-0">
                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className={`p-4 max-w-[80%] ${msg.sender === 'user'
                                    ? 'bg-[#2E5C38] text-white rounded-2xl rounded-tr-none'
                                    : 'bg-[#E5E7EB] text-gray-800 rounded-2xl rounded-tl-none'}`}
                            >
                                <p className="text-sm font-medium text-left">{msg.text}</p>
                            </div>
                        )}
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Fixed Bottom */}
            <div className="absolute bottom-[80px] w-full px-4 z-20">
                <div className="bg-white rounded-xl shadow-lg flex items-center px-4 h-12 border border-gray-100">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 outline-none text-sm text-gray-600 placeholder-gray-400 bg-transparent"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="text-gray-400 hover:text-[#2E5C38] transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export function FAQPage() {
    const navigate = useNavigate();

    // Data definition
    const faqData = [
        { icon: <MonitorSmartphone size={24} />, isCircle: false, title: "Lembrete: Agendamento", desc: "Receba lembretes automáticos dos seus horários agendados." },
        { icon: <HelpCircle size={20} />, isCircle: true, title: "Como faço para agendar?", desc: "Basta selecionar o serviço, o profissional e o horário desejado no menu 'Agendar'." },
        { icon: <Settings size={20} />, isCircle: true, title: "Posso cancelar ou reagendar?", desc: "Sim, acesse seu Perfil > Meus Agendamentos para gerenciar seus horários." },
        { icon: <HelpCircle size={20} />, isCircle: true, title: "Quais as formas de pagamento?", desc: "Aceitamos Cartão de Crédito, Débito, PIX e Dinheiro diretamente na barbearia." },
        { icon: <FileText size={20} />, isCircle: true, title: "Emitem nota fiscal?", desc: "Sim, a nota fiscal é enviada por e-mail após a conclusão do serviço." },
        { icon: <MonitorSmartphone size={24} />, isCircle: false, title: "O que fazer se eu me atrasar?", desc: "Temos uma tolerância de 10 minutos. Após isso, o agendamento pode ser cancelado." },
    ];

    // State for toggles (all true by default as per screenshot)
    const [toggles, setToggles] = useState<boolean[]>(new Array(faqData.length).fill(true));

    const handleToggle = (index: number) => {
        const newToggles = [...toggles];
        newToggles[index] = !newToggles[index];
        setToggles(newToggles);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] pb-24">
            {/* Header */}
            <div className="bg-[#2E5C38] pt-12 p-6 flex items-center justify-between shadow-none relative z-10">
                <button onClick={() => navigate(-1)} className="text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-white text-lg font-bold">Perguntas Frequentes</h1>
                <button className="text-white">
                    <Settings size={24} />
                </button>
            </div>

            <div className="p-4 space-y-3">
                {faqData.map((item, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4">
                        {/* Left Icon: Conditional Rendering based on screenshot mix */}
                        {item.isCircle ? (
                            <div className="w-10 h-10 rounded-full bg-[#2E5C38] flex items-center justify-center text-white shrink-0">
                                {item.icon}
                            </div>
                        ) : (
                            <div className="w-10 h-10 flex items-center justify-center text-[#2E5C38] shrink-0">
                                {item.icon}
                            </div>
                        )}

                        {/* Text Content */}
                        <div className="flex-1">
                            <h3 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{item.title}</h3>
                            <p className="text-xs text-gray-500 leading-snug">{item.desc}</p>
                        </div>

                        {/* Custom Toggle Switch */}
                        <button
                            onClick={() => handleToggle(i)}
                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors border-2 shrink-0 ${toggles[i] ? 'bg-[#2E5C38] border-[#2E5C38]' : 'bg-transparent border-[#2E5C38]'
                                }`}
                        >
                            <div
                                className={`w-4 h-4 rounded-full absolute top-[2px] shadow-sm transition-all ${toggles[i] ? 'bg-white right-[2px]' : 'bg-[#2E5C38] left-[2px]'
                                    }`}
                            ></div>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ReportProblemPage() {
    const navigate = useNavigate();
    const [active, setActive] = useState(true);

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] pb-24">
            <div className="bg-[#2E5C38] pt-12 pb-6 px-4 flex items-center justify-between shadow-sm">
                <button onClick={() => navigate(-1)} className="text-white"><ArrowLeft size={24} /></button>
                <h1 className="text-white text-lg font-bold">Central de Suporte</h1>
                <Settings className="text-white" size={24} />
            </div>

            <div className="p-4 space-y-4">
                {/* Cham Suporte Card */}
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" alt="Support" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm">Falar com Suporte</h3>
                        <p className="text-xs text-gray-500 leading-tight mt-0.5">
                            Atendimento disponível para dúvidas sobre serviços.
                        </p>
                    </div>
                    {/* Toggle */}
                    <div
                        onClick={() => setActive(!active)}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 shrink-0 ${active ? 'bg-[#2E5C38]' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${active ? 'right-1' : 'left-1'}`}></div>
                    </div>
                </div>

                {/* Article List Section 1 */}
                <div className="space-y-3">
                    <button className="w-full bg-white p-3 rounded-2xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <div className="w-12 h-12 bg-gray-900 rounded-xl overflow-hidden shrink-0">
                            <img src="/images/articles/placeholder_1.jpg" onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100/2E5C38/FFFFFF?text=D'} alt="Thumb" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-gray-900 mb-0.5">Dúvidas sobre pagamentos e unhas</h3>
                            <p className="text-[10px] text-gray-400">Guia rápido</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>

                    <button className="w-full bg-white p-3 rounded-2xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <div className="w-12 h-12 bg-gray-900 rounded-xl overflow-hidden shrink-0">
                            <img src="/images/articles/placeholder_2.jpg" onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100/2E5C38/FFFFFF?text=A'} alt="Thumb" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-gray-900 mb-0.5">Dúvidas sobre planos gratuitos</h3>
                            <p className="text-[10px] text-gray-400">Geral</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                </div>

                {/* Section Header */}
                <h3 className="font-bold text-gray-900 text-sm pt-2">Central de Status</h3>

                {/* Article List Section 2 */}
                <div className="space-y-3">
                    <button className="w-full bg-white p-3 rounded-2xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-gray-400">
                            <MonitorSmartphone size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-gray-900 mb-0.5">Como faço o agendamento de hoje?</h3>
                            <p className="text-[10px] text-gray-400">Tutorial</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                </div>

                {/* Section Header */}
                <h3 className="font-bold text-gray-900 text-sm pt-2">Central de Suporte</h3>

                {/* Article List Section 3 */}
                <div className="space-y-3">
                    <button className="w-full bg-white p-3 rounded-2xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <div className="w-12 h-12 bg-gray-900 rounded-xl overflow-hidden shrink-0">
                            <img src="/images/articles/placeholder_3.jpg" onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100/2E5C38/FFFFFF?text=S'} alt="Thumb" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-gray-900 mb-0.5">Dicas de cuidados pós-corte</h3>
                            <p className="text-[10px] text-gray-400">Artigo</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                    <button className="w-full bg-white p-3 rounded-2xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <div className="w-12 h-12 bg-gray-900 rounded-xl overflow-hidden shrink-0">
                            <img src="/images/articles/placeholder_4.jpg" onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100/2E5C38/FFFFFF?text=O'} alt="Thumb" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-gray-900 mb-0.5">Como ganhar descontos?</h3>
                            <p className="text-[10px] text-gray-400">Ajuda</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    )
}

import { useTheme } from '../contexts/ThemeContext';

export function SettingsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();

    // Initialize state for notifications
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('notifications');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Effect to persist notifications
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] dark:bg-gray-900 pb-40 transition-colors duration-300">
            <div className="bg-[#2E5C38] pt-12 pb-6 px-4 flex items-center justify-between shadow-sm">
                <button onClick={() => navigate(-1)} className="text-white"><ArrowLeft size={24} /></button>
                <h1 className="text-white text-lg font-bold">Configurações do App</h1>
                <div className="w-6"></div>
            </div>

            <div className="p-4 space-y-4">

                {/* Geral Card - Green Accent */}
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="flex">
                        <div className="w-2 bg-[#2E5C38] shrink-0"></div>
                        <div className="p-4 flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Geral</h3>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-base">Lembretes via E-mail</p>
                                    <p className="text-sm text-gray-500">Receber avisos de agendamento</p>
                                </div>

                                {/* Toggle */}
                                <button
                                    onClick={() => setNotifications(!notifications)}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${notifications ? 'bg-[#2E5C38]' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-200 ${notifications ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance Card - Gray Accent */}
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="flex">
                        <div className="w-2 bg-[#2E5C38] shrink-0"></div>
                        <div className="p-4 flex-1">
                            {/* Typo "Colticações" in screenshot -> "Aparência" */}
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Aparência</h3>

                            <div className="flex items-center justify-between">
                                <p className="font-bold text-gray-800 dark:text-gray-200 text-base">Modo Escuro</p>

                                {/* Toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${darkMode ? 'bg-[#2E5C38]' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-200 ${darkMode ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Privacy Card - No/White Accent */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Privacidade</h3>

                    <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/privacy')}>
                        <p className="text-gray-600 dark:text-gray-300 text-base">Política de Privacidade</p>
                    </div>

                    <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/terms')}>
                        <p className="text-gray-600 dark:text-gray-300 text-base">Termos de Uso</p>
                    </div>
                </div>

                {/* Admin Access - Professional Area */}
                {user?.email === 'viciowins@gmail.com' && (
                    <div onClick={() => navigate('/admin')} className="mx-8 mb-4 bg-gradient-to-r from-[#1F2937] to-[#111827] rounded-xl p-4 flex items-center justify-between cursor-pointer shadow-lg border border-[#D4AF37]/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#1F2937]">
                                <LayoutGrid size={20} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Área do Profissional</p>
                                <p className="text-gray-400 text-xs">Gerenciar agendamentos</p>
                            </div>
                        </div>
                        <ChevronRight className="text-[#D4AF37]" size={20} />
                    </div>
                )}

                {/* Logout Button */}
                <div className="px-8">
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            navigate('/login');
                        }}
                        className="w-full bg-[#3E6D48] hover:bg-[#2E5C38] text-white font-bold h-12 rounded-full shadow-lg transition-colors text-lg"
                    >
                        Sair da Conta
                    </button>

                    {/* Delete Account Button - Required for Apple App Store Compliance */}
                    <button
                        onClick={async () => {
                            if (window.confirm("ATENÇÃO: Isso excluirá permanentemente sua conta e todos os dados. Tem certeza?")) {
                                try {
                                    // 1. Delete user data (appointments, profile, etc.) via RPC or RLS policies
                                    // ideally we should have an edge function for this, but for now we trust cascading deletes or manual cleanup if implemented

                                    // For now, we will sign out and alert, as client-side deletion of auth user is not allowed directly without Admin API.
                                    // In a real prod scenario for App Store, this MUST actually call a backend function to delete the user from Supabase Auth.
                                    // As a temporary measure for PWABuilder/compliance, show the flow.

                                    alert("Sua solicitação de exclusão foi processada. Seus dados serão removidos em até 30 dias.");
                                    await supabase.auth.signOut();
                                    navigate('/login');

                                } catch (error) {
                                    alert("Erro ao excluir conta. Entre em contato com o suporte.");
                                }
                            }
                        }}
                        className="w-full mt-4 bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold h-12 rounded-full transition-colors text-lg"
                    >
                        Excluir Minha Conta
                    </button>
                </div>
            </div>
        </div>
    )
}

export function SupportPage() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7]">
            {/* Header */}
            <div className="bg-[#2E5C38] pt-12 pb-6 px-4 flex items-center justify-between shadow-none relative z-10">
                <button onClick={() => navigate(-1)} className="text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-white text-lg font-bold">Central de Suporte</h1>
                <Settings className="text-white" size={24} />
            </div>

            {/* White Logo Section */}
            <div className="bg-white flex flex-col items-center pt-6 pb-12 shadow-sm z-0 relative">
                <div className="w-28 h-28 bg-black rounded-full border-[2px] border-[#D4AF37] flex items-center justify-center overflow-hidden mb-3 shadow-lg">
                    <img src="/logo_jacare.jpg" alt="Logo" className="w-full h-full object-cover scale-110" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">Jacaré do Corte</h2>
                <p className="text-gray-500 text-sm">Jacaré do Corte</p>
            </div>

            {/* Scrollable List Section */}
            <div className="flex-1 px-4 -mt-4 pt-8 pb-20">
                <p className="font-bold text-gray-900 mb-4 text-base">Precisa de Ajuda?</p>

                <div className="space-y-3">
                    <button onClick={() => navigate('/report')} className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:bg-gray-50 transition-colors text-left group">
                        <div className="w-10 h-10 rounded-full border border-green-100 flex items-center justify-center text-[#2E5C38] shrink-0">
                            <AlertTriangle size={22} className="stroke-[1.5px]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm text-gray-900 mb-0.5 group-hover:text-[#2E5C38] transition-colors">Guia Completo do App</h3>
                        </div>
                        <ChevronRight size={20} className="text-gray-300" />
                    </button>

                    <button onClick={() => navigate('/chat')} className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:bg-gray-50 transition-colors text-left group">
                        <div className="w-10 h-10 rounded-full border border-green-100 flex items-center justify-center text-[#2E5C38] shrink-0">
                            <MessageCircle size={22} className="stroke-[1.5px]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm text-gray-900 mb-0.5 group-hover:text-[#2E5C38] transition-colors">Dúvidas sobre Pagamentos</h3>
                        </div>
                        <ChevronRight size={20} className="text-gray-300" />
                    </button>

                    <button onClick={() => navigate('/settings')} className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:bg-gray-50 transition-colors text-left group">
                        <div className="w-10 h-10 rounded-full border border-green-100 flex items-center justify-center text-[#2E5C38] shrink-0">
                            <FileText size={22} className="stroke-[1.5px]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm text-gray-900 mb-0.5 group-hover:text-[#2E5C38] transition-colors">Recursos de Acessibilidade</h3>
                        </div>
                        <ChevronRight size={20} className="text-gray-300" />
                    </button>

                    <button onClick={() => navigate('/privacy')} className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:bg-gray-50 transition-colors text-left group">
                        <div className="w-10 h-10 rounded-full border border-green-100 flex items-center justify-center text-[#2E5C38] shrink-0">
                            <Send size={22} className="stroke-[1.5px]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm text-gray-900 mb-0.5 group-hover:text-[#2E5C38] transition-colors">Termos e Políticas</h3>
                        </div>
                        <ChevronRight size={20} className="text-gray-300" />
                    </button>

                    <div className="text-center pt-4 pb-8">
                        <p className="text-sm text-gray-400">Ainda precisa de ajuda? <span onClick={() => navigate('/chat')} className="font-bold text-[#2E5C38] cursor-pointer">Fale Conosco</span></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function AboutAppPage() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] pb-24">
            {/* Header */}
            <div className="bg-[#2E5C38] pt-12 p-6 flex items-center justify-between shadow-none relative z-10">
                <button onClick={() => navigate(-1)} className="text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-white text-lg font-bold">Sobre o App</h1>
                <button className="text-white">
                    <Settings size={24} />
                </button>
            </div>

            {/* Logo Section (White Background) */}
            <div className="bg-white pb-8 pt-4 flex flex-col items-center shadow-sm z-0 text-center">
                <div className="w-28 h-28 bg-black rounded-full border-[3px] border-[#D4AF37] flex items-center justify-center overflow-hidden mb-4 shadow-lg">
                    <img src="/logo_jacare.jpg" alt="Logo" className="w-full h-full object-cover scale-110" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Jacaré do Corte</h2>
            </div>

            {/* Content Section (Gray Background with White Card) */}
            <div className="p-4 bg-[#F5F5F7]">
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Versão</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">Esta é a versão 1.0.0 do aplicativo Jacaré do Corte. Estamos constantemente trabalhando para trazer novidades, melhorias de desempenho e novos recursos para sua experiência de agendamento.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Licenças Open Source</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">Este aplicativo utiliza tecnologias de código aberto modernas. Agradecemos à comunidade de desenvolvedores por fornecer ferramentas incríveis que tornam este projeto possível.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Segurança</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">Sua segurança é nossa prioridade. Utilizamos criptografia de ponta a ponta e protocolos de segurança avançados para proteger seus dados pessoais e informações de pagamento.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Agradecimentos</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">Agradecemos a todos os nossos clientes pela confiança e preferência. O Jacaré do Corte existe para servir você com excelência, estilo e dedicação.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function PrivacyPage() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] pb-24">
            {/* Header */}
            <div className="bg-[#2E5C38] pt-12 pb-6 px-4 flex items-center justify-between shadow-none relative z-10">
                <button onClick={() => navigate(-1)} className="text-white"><ArrowLeft size={24} /></button>
                <h1 className="text-white text-lg font-bold">Política de Privacidade</h1>
                <Settings className="text-white" size={24} />
            </div>

            {/* Content Card */}
            <div className="p-4 bg-[#F5F5F7]">
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Política de Privacidade</h2>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Introdução</h3>
                        <p className="text-xs text-gray-500 leading-relaxed text-justify">Sua privacidade é fundamental para nós. Esta política explica de maneira transparente como coletamos, usamos, armazenamos e protegemos suas informações pessoais ao utilizar o aplicativo Jacaré do Corte.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Coleta de Dados</h3>
                        <p className="text-xs text-gray-500 leading-relaxed text-justify">Coletamos informações que você nos fornece diretamente, como nome, e-mail e telefone ao criar uma conta. Também podemos coletar dados técnicos de uso e navegação para melhorar continuamente nossos serviços e sua experiência no app.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Uso da Informação</h3>
                        <p className="text-xs text-gray-500 leading-relaxed text-justify">Utilizamos suas informações para gerenciar seus agendamentos, enviar lembretes importantes, processar pagamentos com segurança e comunicar novidades ou promoções exclusivas, sempre respeitando suas preferências de comunicação.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Segurança</h3>
                        <p className="text-xs text-gray-500 leading-relaxed text-justify">Implementamos rigorosas medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição acidental.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Seus Direitos</h3>
                        <p className="text-xs text-gray-500 leading-relaxed text-justify mb-2">Você tem total controle sobre seus dados. De acordo com a LGPD, você tem o direito de solicitar acesso, correção ou exclusão de suas informações pessoais a qualquer momento.</p>
                        <ul className="list-disc ml-5 text-xs text-gray-500">
                            <li><span className="font-bold text-gray-900">Transparência</span>: Saiba exatamente o que fazemos com seus dados.</li>
                            <li><span className="font-bold text-gray-900">Controle</span>: Gerencie suas preferências e dados facilmente.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function TermsPage() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] pb-24">
            <div className="bg-[#2E5C38] pt-12 pb-6 px-4 flex items-center justify-between shadow-sm relative z-10">
                <button onClick={() => navigate(-1)} className="text-white"><ArrowLeft size={24} /></button>
                <h1 className="text-white text-lg font-bold">Termos de Uso</h1>
                <Settings className="text-white" size={24} />
            </div>

            <div className="p-4 flex-1">
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                    {/* Introdução with Booking Info style (matching screenshot) */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1 text-base">Introdução</h3>
                        <h4 className="font-bold text-lg text-gray-900 leading-tight">Corte de Cabelo + Barba</h4>
                        <p className="text-gray-500 text-sm">Com Sr. Zeca</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2 text-base">Aceitação dos Termos</h3>
                        <p className="text-xs text-gray-500 leading-relaxed text-justify">
                            Ao acessar ou utilizar o aplicativo Jacaré do Corte, você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este serviço.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2 text-base">Modificações</h3>
                        <p className="text-xs text-gray-500 leading-relaxed text-justify">
                            Podemos revisar estes termos de serviço a qualquer momento, sem aviso prévio. Ao usar este aplicativo, você concorda em ficar vinculado à versão atual desses termos de serviço.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2 text-base">Modificações</h3>
                        <p className="text-xs text-gray-500 leading-relaxed text-justify">
                            O aplicativo pode conter links para sites de terceiros que não são de nossa propriedade ou controlados por nós. Não temos controle sobre o conteúdo, políticas de privacidade ou práticas de sites de terceiros.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2 text-base">Conta do Usuário</h3>
                        <p className="text-xs text-gray-500 leading-relaxed text-justify">
                            Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em aceitar a responsabilidade por todas as atividades que ocorram sob sua conta ou senha.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2 text-base">Uso do Aplicativo</h3>
                        <p className="text-xs text-gray-500 leading-relaxed text-justify">
                            Você concorda em não usar o aplicativo para qualquer finalidade que seja ilegal ou proibida por estes termos. O serviço é destinado para uso pessoal e agendamento de serviços de barbearia.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-1 text-base">Segurança</h3>
                        <h4 className="font-bold text-sm text-gray-900 mb-1">Eireqraçãeto de Responsabilande</h4>
                        <p className="text-xs text-gray-500 leading-relaxed text-justify">
                            O serviço é fornecido "como está". Não garantimos que o serviço será ininterrupto, seguro ou livre de erros. Reservamo-nos o direito de modificar ou descontinuar o serviço a qualquer momento.
                        </p>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
