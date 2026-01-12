
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    Users,
    Settings,
    DollarSign,

    MoreHorizontal,
    Bell,
    Check,
    MessageCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MockDB } from '../lib/mockDb';

interface AdminAppointment {
    id: string;
    start_time: string;
    status: string;
    profiles: { full_name: string; phone: string } | null; // Joined from 'profiles' or User metadata if possible
    services: { name: string; price: number };
    barbers: { name: string };
}

// Mock automation settings
const MOCK_AUTOMATIONS = [
    { title: 'Lembrete via E-mail (1h antes)', active: true, desc: 'Envia e-mail automático 1 hora antes do atendimento.' },
    { title: 'Confirmação Automática', active: false, desc: 'Confirma agendamentos pagos via PIX automaticamente. (Em breve)' },
    { title: 'Solicitação de Avaliação', active: false, desc: 'Pede feedback ao cliente após o serviço. (Em breve)' }
];

export function AdminDashboardPage() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ todayCount: 0, todayRevenue: 0 });
    const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);
    const [activeTab, setActiveTab] = useState<'daily' | 'automations'>('daily');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCustomers, setShowCustomers] = useState(false);

    // Mock Data for new features
    const [notificationsList, setNotificationsList] = useState([
        { id: 1, text: 'Novo agendamento: João Silva - 14:00', time: '5 min', unread: true },
        { id: 2, text: 'Maria cancelou o horário de 16:30', time: '1h', unread: true },
        { id: 3, text: 'Meta de faturamento diária atingida! 🚀', time: '2h', unread: false },
    ]);

    const markAllAsRead = () => {
        setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })));
        // In a real app, we would also update this in the backend
    };

    const customers = [
        { id: 1, name: 'João Silva', phone: '(11) 99999-1111', lastVisit: 'Hoje' },
        { id: 2, name: 'Maria Oliveira', phone: '(11) 98888-2222', lastVisit: 'Ontem' },
        { id: 3, name: 'Pedro Santos', phone: '(11) 97777-3333', lastVisit: 'Há 5 dias' },
        { id: 4, name: 'Carlos Souza', phone: '(11) 96666-4444', lastVisit: 'Há 1 semana' },
    ];

    useEffect(() => {
        fetchAppointments();
        const savedAutos = localStorage.getItem('admin_automations_v2');
        if (savedAutos) {
            setAutomations(JSON.parse(savedAutos));
        }
    }, []);

    const fetchAppointments = async () => {
        // ... (unchanged)
    };

    // ...

    const handleToggleAutomation = (index: number) => {
        const newAutos = [...automations];
        newAutos[index].active = !newAutos[index].active;
        setAutomations(newAutos);
        localStorage.setItem('admin_automations_v2', JSON.stringify(newAutos));
    }

    const handleAction = async (id: string, action: 'confirm' | 'cancel') => {
        const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';

        // 1. Try Supabase
        try {
            await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
        } catch (e) { console.log('Supabase update failed, using local'); }

        // 2. Try MockDB
        MockDB.updateAppointment(id, { status: newStatus });

        // 3. Update Local State UI
        setAppointments(prev => prev.map(a =>
            a.id === id ? { ...a, status: newStatus } : a
        ));
    };

    const todayList = appointments.filter(a => isSameDay(parseISO(a.start_time), new Date()));

    return (
        <div className="flex flex-col min-h-screen bg-[#F3F4F6]">
            {/* Sidebar / Desktop Layout would be better, but sticking to Mobile-First responsive */}

            {/* Header */}
            <div className="bg-[#1F2937] text-white pt-12 pb-8 px-6 rounded-b-[40px] shadow-lg sticky top-0 z-20">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] bg-clip-text text-transparent">
                            Painel do Dono
                        </h1>
                        <p className="text-gray-400 text-xs mt-1">Bem-vindo, Chefe</p>
                    </div>
                    <div className="flex gap-3 relative">
                        <button
                            onClick={() => { setShowNotifications(!showNotifications); setShowCustomers(false); }}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm relative hover:bg-white/20 transition-colors"
                        >
                            <Bell size={20} />
                            {notificationsList.some(n => n.unread) && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                        </button>
                        <button
                            onClick={() => { setShowCustomers(!showCustomers); setShowNotifications(false); }}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors"
                        >
                            <Users size={20} />
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute top-12 right-0 w-72 bg-white rounded-xl shadow-2xl overflow-hidden z-50 text-gray-800 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-sm">Notificações</div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notificationsList.map(n => (
                                        <div key={n.id} className={`p-3 border-b border-gray-50 text-sm hover:bg-gray-50 cursor-pointer ${n.unread ? 'bg-blue-50/50' : ''}`}>
                                            <p className="font-medium text-gray-800">{n.text}</p>
                                            <p className="text-xs text-gray-400 mt-1">{n.time} atrás</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-2 text-center border-t border-gray-100 bg-gray-50">
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs font-bold text-[#2E5C38] hover:underline"
                                    >
                                        Marcar todas como lidas
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Customers Dropdown */}
                        {showCustomers && (
                            <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 text-gray-800 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-sm flex justify-between items-center">
                                    <span>Clientes Recentes</span>
                                    <span className="bg-[#2E5C38] text-white text-[10px] px-2 py-0.5 rounded-full">{customers.length}</span>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {customers.map(c => (
                                        <div key={c.id} className="p-3 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {c.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900">{c.name}</p>
                                                    <p className="text-xs text-gray-500">{c.phone}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400">Última vez</p>
                                                <p className="text-xs font-medium text-[#2E5C38]">{c.lastVisit}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-2 text-center border-t border-gray-100 bg-gray-50">
                                    <button className="text-xs font-bold text-[#2E5C38]">Ver lista completa</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-white/70">
                            <CalendarIcon size={16} />
                            <span className="text-xs font-medium">Hoje</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.todayCount}</p>
                        <p className="text-[10px] text-white/50">Agendamentos</p>
                    </div>
                    <div className="bg-[#D4AF37] rounded-2xl p-4 shadow-lg text-black">
                        <div className="flex items-center gap-2 mb-2 text-black/70">
                            <DollarSign size={16} />
                            <span className="text-xs font-bold">Faturamento</span>
                        </div>
                        <p className="text-3xl font-bold">R$ {stats.todayRevenue}</p>
                        <p className="text-[10px] text-black/60">Estimado hoje</p>
                    </div>
                </div>
            </div>

            {/* Menu Tabs */}
            <div className="px-6 mt-6 mb-4">
                <div className="bg-white p-1 rounded-xl flex shadow-sm">
                    <button
                        onClick={() => setActiveTab('daily')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'daily' ? 'bg-[#1F2937] text-white shadow-md' : 'text-gray-500'}`}
                    >
                        Agenda
                    </button>
                    <button
                        onClick={() => setActiveTab('automations')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'automations' ? 'bg-[#1F2937] text-white shadow-md' : 'text-gray-500'}`}
                    >
                        Automação ⚡
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-6 pb-24 space-y-4">

                {activeTab === 'daily' && (
                    <>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Próximos Clientes</h2>
                            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                                {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
                            </span>
                        </div>

                        {loading ? (
                            <div className="text-center py-10 text-gray-400">Carregando agenda...</div>
                        ) : todayList.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-dashed border-gray-300">
                                <CalendarIcon size={40} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">Agenda livre por enquanto!</p>
                            </div>
                        ) : (
                            todayList.map((apt) => (
                                <div key={apt.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-l-[#1F2937]">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
                                            <span className="text-sm font-bold text-gray-900">
                                                {format(parseISO(apt.start_time), 'HH:mm')}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight">
                                                {apt.profiles?.full_name || 'Cliente'}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">{apt.services.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`mailto:${apt.profiles?.full_name?.replace(/\s/g, '.').toLowerCase()}@email.com?subject=Lembrete de Agendamento&body=Olá ${apt.profiles?.full_name?.split(' ')[0]}, tudo confirmado para seu horário no Jacaré do Corte!`}
                                            target="_blank"
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                            title="Enviar E-mail"
                                        >
                                            <MessageCircle size={18} />
                                        </a>
                                        <button
                                            onClick={() => handleAction(apt.id, 'confirm')}
                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${apt.status === 'confirmed' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                            title="Confirmar Presença"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Cancelar agendamento?')) handleAction(apt.id, 'cancel');
                                            }}
                                            className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                                            title="Cancelar"
                                        >
                                            <MoreHorizontal size={18} className="rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}

                {activeTab === 'automations' && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-[#1F2937] to-[#374151] p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-1">Piloto Automático</h3>
                                <p className="text-sm text-white/70 mb-4">Deixe o sistema trabalhar por você.</p>
                                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    Sistema Ativo
                                </div>
                            </div>
                            {/* Decor */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-10 blur-3xl rounded-full"></div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            {automations.map((auto, i) => (
                                <div key={i} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${auto.active ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <Settings size={20} className={auto.active ? 'animate-[spin_10s_linear_infinite]' : ''} />
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm">{auto.title}</h4>
                                        </div>
                                        <button
                                            onClick={() => handleToggleAutomation(i)}
                                            className={`w-12 h-6 rounded-full relative transition-colors ${auto.active ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${auto.active ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 pl-[52px]">{auto.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Simple Bottom Nav for Admin */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1F2937] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 border border-white/10">
                <button
                    onClick={() => setActiveTab('daily')}
                    className={`flex flex-col items-center ${activeTab === 'daily' ? 'text-[#D4AF37]' : 'text-gray-400 hover:text-white'}`}
                >
                    <LayoutDashboard size={24} />
                </button>
                <div className="w-[1px] h-8 bg-white/20"></div>
                <button
                    onClick={() => navigate('/home')} // Exit to App
                    className="flex flex-col items-center text-gray-400 hover:text-white"
                >
                    <span className="text-xs font-bold">Sair</span>
                </button>
            </div>

        </div>
    );
}
