
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    Users,
    Settings,
    DollarSign,
    MoreHorizontal,
    Bell,
    Check,
    MessageCircle,
    ShieldAlert,
    RefreshCw,
    Power
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MockDB } from '../lib/mockDb';

interface AdminAppointment {
    id: string;
    start_time: string;
    status: string;
    profiles: { full_name: string; phone: string } | null;
    services: { name: string; price: number };
    barbers: { name: string };
}

interface PaymentRequest {
    id: string;
    user_id: string;
    user_email: string;
    user_name: string;
    user_phone: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface RealClient {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    avatar_url: string;
    created_at: string;
    last_appointment?: string;
}

interface Notification {
    id: string;
    text: string;
    time: string;
    unread: boolean;
    type: 'new_apt' | 'cancel' | 'payment';
}

const MOCK_AUTOMATIONS = [
    { title: 'Lembrete via WhatsApp (1h antes)', active: true, desc: 'Envia mensagem automática 1 hora antes do atendimento.' },
    { title: 'Confirmação Automática', active: false, desc: 'Confirma agendamentos pagos via PIX automaticamente. (Em breve)' },
    { title: 'Solicitação de Avaliação', active: false, desc: 'Pede feedback ao cliente após o serviço. (Em breve)' }
];

export function AdminDashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isMaster = user?.email === 'araucariainforma@gmail.com';

    const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ todayCount: 0, todayRevenue: 0 });
    const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);
    const [activeTab, setActiveTab] = useState<'agenda' | 'automations' | 'pending_users' | 'clients'>('agenda');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCustomers, setShowCustomers] = useState(false);

    // ✅ REAL: Payment requests from Supabase
    const [pendingUsers, setPendingUsers] = useState<PaymentRequest[]>([]);

    // ✅ REAL: Clients from Supabase profiles
    const [clients, setClients] = useState<RealClient[]>([]);

    // ✅ REAL: Notifications from recent appointments
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // ✅ REAL: App status from Supabase
    const [appStatus, setAppStatus] = useState<'active' | 'blocked'>('active');
    const [togglingStatus, setTogglingStatus] = useState(false);

    // =========================================
    // FETCH: App Status
    // =========================================
    const fetchAppStatus = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'app_status')
                .single();
            if (data) setAppStatus(data.value as 'active' | 'blocked');
        } catch { }
    }, []);

    // =========================================
    // TOGGLE: App Status (REAL - saves to Supabase)
    // =========================================
    const handleToggleAppStatus = async () => {
        setTogglingStatus(true);
        const newStatus = appStatus === 'active' ? 'blocked' : 'active';
        try {
            const { error } = await supabase
                .from('app_settings')
                .update({ value: newStatus, updated_at: new Date().toISOString() })
                .eq('key', 'app_status');

            if (error) throw error;
            setAppStatus(newStatus);
        } catch (err: any) {
            alert('Erro ao alterar status: ' + err.message);
        } finally {
            setTogglingStatus(false);
        }
    };

    // =========================================
    // FETCH: Appointments + Stats
    // =========================================
    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        let allAppointments: any[] = [];

        const mockData = MockDB.getAppointments();
        allAppointments = [...mockData];

        try {
            const { data: supabaseData, error } = await supabase
                .from('appointments')
                .select(`*, profiles!user_id(full_name, phone), services!service_id(name, price), barbers!barber_id(name)`)
                .order('start_time', { ascending: true });

            if (!error && supabaseData) {
                const mockIds = new Set(mockData.map(a => a.id));
                const newData = supabaseData.filter(a => !mockIds.has(a.id));
                allAppointments = [...allAppointments, ...newData];
            }
        } catch { }

        setAppointments(allAppointments as AdminAppointment[]);
        const totalRevenue = allAppointments.reduce((acc, curr) => acc + ((curr.services as any)?.price || 0), 0);
        setStats({ todayCount: allAppointments.length, todayRevenue: totalRevenue });
        setLoading(false);
    }, []);

    // =========================================
    // FETCH: Real Notifications from recent appointments
    // =========================================
    const fetchNotifications = useCallback(async () => {
        const notifs: Notification[] = [];

        try {
            // Last 24h appointments as notifications
            const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { data } = await supabase
                .from('appointments')
                .select(`*, profiles!user_id(full_name)`)
                .gte('created_at', since)
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) {
                data.forEach((apt: any) => {
                    const name = apt.profiles?.full_name || 'Cliente';
                    const time = formatDistanceToNow(parseISO(apt.created_at || apt.start_time), { locale: ptBR, addSuffix: false });

                    if (apt.status === 'cancelled') {
                        notifs.push({
                            id: apt.id + '_cancel',
                            text: `${name} cancelou o horário`,
                            time,
                            unread: true,
                            type: 'cancel'
                        });
                    } else {
                        notifs.push({
                            id: apt.id + '_new',
                            text: `Novo agendamento: ${name} - ${format(parseISO(apt.start_time), 'HH:mm')}`,
                            time,
                            unread: true,
                            type: 'new_apt'
                        });
                    }
                });
            }
        } catch { }

        // Pending payments as notifications too
        try {
            const { data } = await supabase
                .from('payment_requests')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) {
                data.forEach((req: any) => {
                    const time = formatDistanceToNow(parseISO(req.created_at), { locale: ptBR, addSuffix: false });
                    notifs.push({
                        id: req.id,
                        text: `💰 ${req.user_name || 'Novo usuário'} enviou comprovante de pagamento`,
                        time,
                        unread: true,
                        type: 'payment'
                    });
                });
            }
        } catch { }

        setNotifications(notifs);
    }, []);

    // =========================================
    // FETCH: Real Payment Requests
    // =========================================
    const fetchPendingUsers = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('payment_requests')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setPendingUsers(data as PaymentRequest[]);
            }
        } catch {
            // Fallback to MockDB
            setPendingUsers(MockDB.getPendingRequests() as any);
        }
    }, []);

    // =========================================
    // FETCH: Real Clients from profiles
    // =========================================
    const fetchClients = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                setClients(data as RealClient[]);
            }
        } catch { }
    }, []);

    // =========================================
    // APPROVE User (REAL - updates Supabase)
    // =========================================
    const handleApproveUser = async (requestId: string, userId: string) => {
        try {
            const { error } = await supabase
                .from('payment_requests')
                .update({ status: 'approved', approved_at: new Date().toISOString() })
                .eq('id', requestId);

            if (error) throw error;

            // Optimistic UI update
            setPendingUsers(prev => prev.filter(u => u.id !== requestId));
            alert('✅ Usuário aprovado! Acesso liberado.');
        } catch (err: any) {
            // Fallback to MockDB
            MockDB.updateUserStatus(userId, 'approved');
            setPendingUsers(prev => prev.filter(u => u.id !== requestId));
            alert('✅ Aprovado localmente (Supabase: ' + err.message + ')');
        }
    };

    const handleAction = async (id: string, action: 'confirm' | 'cancel') => {
        const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
        try {
            await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
        } catch { }
        MockDB.updateAppointment(id, { status: newStatus });
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    };

    const handleToggleAutomation = (index: number) => {
        const newAutos = [...automations];
        newAutos[index].active = !newAutos[index].active;
        setAutomations(newAutos);
        localStorage.setItem('admin_automations_v2', JSON.stringify(newAutos));
    };

    const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

    useEffect(() => {
        fetchAppointments();
        fetchNotifications();
        fetchPendingUsers();
        fetchClients();
        fetchAppStatus();

        const savedAutos = localStorage.getItem('admin_automations_v2');
        if (savedAutos) setAutomations(JSON.parse(savedAutos));
    }, []);

    const todayList = appointments;
    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="flex flex-col min-h-screen bg-[#F3F4F6]">
            {/* Header */}
            <div className="bg-[#1F2937] text-white pt-12 pb-8 px-6 rounded-b-[40px] shadow-lg sticky top-0 z-20">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] bg-clip-text text-transparent">
                            Painel do Dono
                        </h1>
                        <p className="text-gray-400 text-xs mt-1">Bem-vindo, Chefe</p>
                    </div>

                    {/* ✅ MASTER CONTROL - REAL */}
                    {isMaster && (
                        <div className="absolute top-20 left-6 z-50">
                            <div className="bg-red-900/90 backdrop-blur-md border border-red-500 text-white p-4 rounded-xl shadow-2xl max-w-xs">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldAlert className="text-red-300" size={20} />
                                    <h3 className="font-bold text-sm uppercase tracking-wider">Master Control</h3>
                                </div>
                                <p className="text-[10px] text-white/70 mb-3">
                                    Você está no Modo Espião. Controle total do sistema.
                                </p>
                                <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg">
                                    <span className="text-xs font-bold flex items-center gap-2">
                                        <Power size={14} />
                                        Status do App:
                                    </span>
                                    <button
                                        onClick={handleToggleAppStatus}
                                        disabled={togglingStatus}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${appStatus === 'active'
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-red-600 text-white hover:bg-red-700'
                                            } disabled:opacity-60`}
                                    >
                                        {togglingStatus
                                            ? <RefreshCw size={10} className="animate-spin" />
                                            : appStatus === 'active' ? '🟢 ATIVO' : '🔴 BLOQUEADO'
                                        }
                                    </button>
                                </div>
                                <p className="text-[9px] text-white/40 mt-2">
                                    {appStatus === 'active'
                                        ? 'Clique para colocar em manutenção (bloqueia todos os usuários)'
                                        : 'Clique para reativar o app para todos os usuários'
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 relative">
                        {/* Notifications */}
                        <button
                            onClick={() => { setShowNotifications(!showNotifications); setShowCustomers(false); }}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm relative hover:bg-white/20 transition-colors"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
                                    {unreadCount}
                                </div>
                            )}
                        </button>
                        <button
                            onClick={() => { setShowCustomers(!showCustomers); setShowNotifications(false); }}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors"
                        >
                            <Users size={20} />
                        </button>

                        {/* ✅ REAL Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 text-gray-800 border border-gray-100">
                                <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-sm flex justify-between">
                                    <span>Notificações</span>
                                    {unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} novas</span>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-gray-400 text-sm">Nenhuma notificação recente</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`p-3 border-b border-gray-50 text-sm hover:bg-gray-50 cursor-pointer ${n.unread ? 'bg-blue-50/50' : ''}`}>
                                                <p className="font-medium text-gray-800">{n.text}</p>
                                                <p className="text-xs text-gray-400 mt-1">há {n.time}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-2 text-center border-t border-gray-100 bg-gray-50">
                                    <button onClick={markAllAsRead} className="text-xs font-bold text-[#2E5C38] hover:underline">
                                        Marcar todas como lidas
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ✅ REAL Clients Dropdown */}
                        {showCustomers && (
                            <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 text-gray-800 border border-gray-100">
                                <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-sm flex justify-between items-center">
                                    <span>Clientes Cadastrados</span>
                                    <span className="bg-[#2E5C38] text-white text-[10px] px-2 py-0.5 rounded-full">{clients.length}</span>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {clients.length === 0 ? (
                                        <div className="p-6 text-center text-gray-400 text-sm">Nenhum cliente cadastrado ainda</div>
                                    ) : (
                                        clients.map(c => (
                                            <div key={c.id} className="p-3 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    {c.avatar_url ? (
                                                        <img src={c.avatar_url} alt={c.full_name} className="w-9 h-9 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-[#2E5C38]/10 flex items-center justify-center text-sm font-bold text-[#2E5C38]">
                                                            {(c.full_name || c.email || '?').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">{c.full_name || 'Sem nome'}</p>
                                                        <p className="text-xs text-gray-500">{c.phone || c.email}</p>
                                                    </div>
                                                </div>
                                                {c.phone && (
                                                    <a
                                                        href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center hover:bg-green-100"
                                                    >
                                                        <MessageCircle size={16} />
                                                    </a>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-white/70">
                            <CalendarIcon size={16} />
                            <span className="text-xs font-medium">Total</span>
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
                        <p className="text-[10px] text-black/60">Estimado total</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 mt-6 mb-4">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl mb-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('agenda')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap px-3 ${activeTab === 'agenda' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                        Agenda
                    </button>
                    <button
                        onClick={() => setActiveTab('clients')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap px-3 ${activeTab === 'clients' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                        Clientes
                    </button>
                    {isMaster && (
                        <button
                            onClick={() => setActiveTab('pending_users')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap px-3 relative ${activeTab === 'pending_users' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                        >
                            Aprovações
                            {pendingUsers.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {pendingUsers.length}
                                </span>
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('automations')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap px-3 ${activeTab === 'automations' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                        ⚡ Auto
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 pb-24 space-y-4">

                {/* AGENDA */}
                {activeTab === 'agenda' && (
                    <>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Agendamentos</h2>
                            <div className="flex gap-2 items-center">
                                <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                                    {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
                                </span>
                                <button onClick={fetchAppointments} className="w-8 h-8 bg-white border rounded-full flex items-center justify-center text-gray-500 hover:text-[#2E5C38]">
                                    <RefreshCw size={14} />
                                </button>
                            </div>
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
                                            <p className="text-xs text-gray-500 mt-0.5">{apt.services?.name}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : apt.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`https://wa.me/55${apt.profiles?.phone?.replace(/\D/g, '') || ''}?text=Olá ${apt.profiles?.full_name?.split(' ')[0] || 'Cliente'}, tudo confirmado para seu horário de ${format(parseISO(apt.start_time), 'HH:mm')} no Jacaré do Corte! 🐊`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => { if (!apt.profiles?.phone) { e.preventDefault(); alert('Cliente sem telefone!'); } }}
                                            className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                                        >
                                            <MessageCircle size={18} />
                                        </a>
                                        <button
                                            onClick={() => handleAction(apt.id, 'confirm')}
                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${apt.status === 'confirmed' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('Cancelar agendamento?')) handleAction(apt.id, 'cancel'); }}
                                            className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                                        >
                                            <MoreHorizontal size={18} className="rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}

                {/* ✅ REAL CLIENTS */}
                {activeTab === 'clients' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Clientes Cadastrados</h2>
                            <span className="text-xs bg-[#2E5C38] text-white px-3 py-1 rounded-full font-bold">{clients.length} total</span>
                        </div>
                        {clients.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                                <Users size={40} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">Nenhum cliente cadastrado ainda</p>
                            </div>
                        ) : (
                            clients.map(c => (
                                <div key={c.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
                                    {c.avatar_url ? (
                                        <img src={c.avatar_url} alt={c.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[#2E5C38]/10 flex items-center justify-center text-lg font-bold text-[#2E5C38] flex-shrink-0">
                                            {(c.full_name || c.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{c.full_name || 'Sem nome'}</p>
                                        <p className="text-xs text-gray-500 truncate">{c.email}</p>
                                        {c.phone && <p className="text-xs text-green-600 font-medium">{c.phone}</p>}
                                    </div>
                                    {c.phone && (
                                        <a
                                            href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 flex-shrink-0"
                                        >
                                            <MessageCircle size={18} />
                                        </a>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ✅ REAL PAYMENT APPROVALS */}
                {activeTab === 'pending_users' && (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                            <h3 className="text-base font-bold text-gray-900 mb-1">💰 Aprovar Pagamentos (R$ 15,00)</h3>
                            <p className="text-gray-600 text-sm">
                                Clientes que enviaram comprovante via WhatsApp. Confirme o PIX e clique em <strong>Aprovar</strong>.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            {pendingUsers.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <Check size={32} className="mx-auto mb-2 text-green-400" />
                                    <p className="font-medium">Nenhum pagamento pendente!</p>
                                </div>
                            ) : (
                                pendingUsers.map(req => (
                                    <div key={req.id} className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold text-sm">
                                                {(req.user_name || req.user_email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{req.user_name || 'Usuário'}</p>
                                                <p className="text-xs text-gray-400">{req.user_email}</p>
                                                {req.user_phone && <p className="text-xs text-green-600">{req.user_phone}</p>}
                                                <p className="text-[10px] text-gray-300">
                                                    {formatDistanceToNow(parseISO(req.created_at), { locale: ptBR, addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {req.user_phone && (
                                                <a
                                                    href={`https://wa.me/55${req.user_phone.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-9 h-9 bg-green-50 text-green-600 rounded-full flex items-center justify-center"
                                                >
                                                    <MessageCircle size={16} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleApproveUser(req.id, req.user_id)}
                                                className="bg-[#2E5C38] text-white text-xs font-bold px-4 py-2 rounded-full shadow hover:bg-[#1E3F24] transition-colors"
                                            >
                                                Aprovar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* AUTOMATIONS */}
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

            {/* Bottom Nav */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1F2937] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 border border-white/10">
                <button
                    onClick={() => setActiveTab('agenda')}
                    className={`flex flex-col items-center ${activeTab === 'agenda' ? 'text-[#D4AF37]' : 'text-gray-400 hover:text-white'}`}
                >
                    <LayoutDashboard size={24} />
                </button>
                <div className="w-[1px] h-8 bg-white/20"></div>
                <button
                    onClick={() => navigate('/home')}
                    className="flex flex-col items-center text-gray-400 hover:text-white"
                >
                    <span className="text-xs font-bold">Sair</span>
                </button>
            </div>
        </div>
    );
}
