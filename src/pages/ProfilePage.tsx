import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, CreditCard, Settings, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
    const navigate = useNavigate();
    const { user } = useAuth();


    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] pb-24">
            {/* Header Section */}
            <div className="bg-[#2E5C38] pt-12 pb-8 px-4 rounded-b-[35px] shadow-sm relative z-10">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => navigate(-1)} className="text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-white text-lg font-bold">Meu Perfil</h1>
                    <button onClick={() => navigate('/settings')} className="text-white">
                        <Settings size={24} />
                    </button>
                </div>

                {/* User Info Row */}
                <div className="flex items-center gap-4 px-2">
                    <div className="w-24 h-24 rounded-full border-[3px] border-[#D4AF37] p-1 shrink-0">
                        <div className="w-full h-full rounded-full bg-white overflow-hidden">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                                alt="User"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col text-white">
                        <h2 className="text-xl font-bold mb-1">{user?.user_metadata?.full_name || 'Usuário da Silva'}</h2>
                        <p className="text-white/80 text-sm">Telefone: {user?.user_metadata?.phone || '(31) 98765-4321'}</p>
                        <p className="text-white/80 text-sm">Email: {user?.email || 'usuario@email.com'}</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="px-4 space-y-4 -mt-0 pt-6">

                {/* History Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 text-sm">Histórico de Agendamentos</h3>
                        <Calendar size={20} className="text-gray-400" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                            <div>
                                <p className="font-bold text-gray-800 text-sm">Corte + Barba</p>
                                <p className="text-xs text-gray-500">21/12/2023 - Sr. Mora</p>
                                <p className="text-xs text-gray-400">Barbearia Central</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-medium">12:00</p>
                                <p className="text-xs text-gray-400">45 min</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-gray-800 text-sm">Corte Social</p>
                                <p className="text-xs text-gray-500">17/12/2023 - Sr. Zeca</p>
                                <p className="text-xs text-gray-400">Barbearia Central</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-medium">15:30</p>
                                <p className="text-xs text-gray-400">30 min</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 text-sm">Formas de Pagamento</h3>
                        <CreditCard size={20} className="text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                                <div className="w-4 h-4 bg-gray-400 rounded-full opacity-50"></div>
                            </div>
                            <span className="text-sm font-bold text-gray-800 tracking-widest">••• ••• ••• 1234</span>
                        </div>
                        <span className="text-xs text-gray-400">Adicionar novo</span>
                    </div>
                </div>

                {/* App Settings Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">Configurações do App</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User size={20} className="text-gray-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">Modo Escuro</p>
                                <p className="text-xs text-gray-400">Privacidade</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Privacy Card (Extra as per screenshot bottom) */}
                <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-3">
                    <Lock size={20} className="text-gray-400" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">Privacidade</p>
                        <p className="text-xs text-gray-400">Privacidade</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
