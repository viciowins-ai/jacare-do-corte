import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SuccessBookingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { serviceName, barberName, date } = location.state || {};

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7]">
            {/* Header */}
            <div className="bg-[#2E5C38] pt-12 pb-24 px-6 flex items-center justify-between shadow-none relative z-10">
                <button onClick={() => navigate('/home')} className="text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-white text-lg font-bold">Agendamento Confirmado</h1>
                <button className="text-white">
                    <Settings size={24} />
                </button>
            </div>

            {/* Main Content Card - Floating Over Header */}
            <div className="flex items-start justify-center -mt-16 z-20 px-4">
                <div className="bg-white rounded-[30px] shadow-lg w-full p-6 pt-16 relative flex flex-col items-center text-center">

                    {/* Confetti & Checkmark Container - Floating higher than card */}
                    <div className="absolute -top-16 left-0 right-0 flex justify-center items-center h-32 pointer-events-none">
                        {/* CSS Confetti/Particles */}
                        <div className="absolute top-10 left-[25%] w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-80"></div>
                        <div className="absolute top-4 right-[30%] w-2 h-2 bg-[#D4AF37] rounded-full opacity-60"></div>
                        <div className="absolute top-20 right-[20%] w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-90"></div>
                        <div className="absolute bottom-10 left-[20%] w-1 h-1 bg-[#D4AF37] rounded-full opacity-70"></div>
                        <div className="absolute bottom-20 right-10 w-2 h-2 bg-[#D4AF37] rounded-full opacity-50"></div>
                        <div className="absolute top-8 left-10 w-1.5 h-1.5 bg-[#D4AF37] opacity-60 rotate-45"></div>
                        <div className="absolute top-12 right-6 w-2 h-2 bg-[#D4AF37] opacity-60 rotate-12"></div>

                        {/* Main Checkmark Circle */}
                        <div className="w-28 h-28 bg-[#2E5C38] rounded-full border-[4px] border-[#D4AF37] flex items-center justify-center relative z-30 shadow-md">
                            <Check size={56} strokeWidth={4} className="text-[#D4AF37]" />
                        </div>
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Agendamento</h2>
                    <h2 className="text-2xl font-bold text-gray-900 mb-10">Realizado!</h2>

                    <div className="w-full text-left space-y-4 mb-10 pl-2">
                        <div className="flex gap-2 text-sm text-gray-800">
                            <span className="font-bold">Serviço:</span>
                            <span className="font-normal">{serviceName || 'Corte + Barba'}</span>
                        </div>
                        <div className="flex gap-2 text-sm text-gray-800">
                            <span className="font-bold">Profissional:</span>
                            <span className="font-normal">{barberName || 'Sr. Mora'}</span>
                        </div>

                        <div className="mt-2">
                            <p className="text-gray-500 text-xs mt-1">
                                Data e Hora: {date ? format(new Date(date), "d 'de' MMMM, yyyy - HH:mm", { locale: ptBR }) : '5 de Dezembro, 2025 - 09:00'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/home')}
                        className="w-full h-14 bg-[#2E5C38] border-2 border-[#D4AF37] text-white font-bold rounded-full shadow-md text-base hover:bg-[#1E3F24] transition-colors"
                    >
                        Adicionar ao Calendario
                    </button>

                </div>
            </div>
        </div>
    );
}
