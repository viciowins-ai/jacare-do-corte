import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CreditCard, Settings, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { MockDB } from '../lib/mockDb';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
    id: string;
    service_id: string;
    date: string;
    start_time: string;
    professional_id: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}

const SERVICES = {
    'corte-cabelo': 'Corte de Cabelo',
    'barba': 'Barba',
    'combo': 'Combo (Corte + Barba)',
    'sobrancelha': 'Sobrancelha',
    'acabamento': 'Pezinho/Acabamento'
} as const;

export function ProfilePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<'pix' | 'card'>('pix');

    useEffect(() => {
        loadHistory();
    }, [user]);

    const loadHistory = async () => {
        if (!user) return;

        let supabaseData: any[] = [];
        try {
            const { data } = await supabase
                .from('appointments')
                .select('*')
                .eq('user_id', user.id)
                .order('start_time', { ascending: false });
            if (data) supabaseData = data;
        } catch (e) {
            console.log('Online fetch failed');
        }

        const localData = MockDB.getAppointments().filter(a => a.user_id === user.id);

        // Merge and Sort Descending (Newest first)
        const allData = [...localData, ...supabaseData].sort((a, b) =>
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );

        setAppointments(allData);
    };

    const getServiceName = (id: string) => {
        return SERVICES[id as keyof typeof SERVICES] || 'Serviço Personalizado';
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] dark:bg-gray-900 pb-40 transition-colors duration-300">
            {/* Header Section */}
            <div className="bg-[#2E5C38] pt-12 pb-8 px-4 rounded-b-[35px] shadow-sm relative z-10">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => navigate(-1)} className="text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-white text-lg font-bold">Meu Perfil</h1>
                    <div className="w-6"></div>
                </div>

                {/* User Info Row */}
                <div className="flex items-center gap-4 px-2">
                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                        <div className="w-24 h-24 rounded-full border-[3px] border-[#D4AF37] p-1 shrink-0 relative overflow-hidden">
                            <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
                                <img
                                    src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_metadata?.full_name || 'User'}`}
                                    alt="User"
                                    className="w-full h-full object-cover object-center"
                                />
                                { /* Upload Overlay */}
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Camera Icon Badge (Always visible on mobile) */}
                        <div className="absolute bottom-1 right-1 bg-[#2E5C38] w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                        </div>
                    </div>
                    <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            try {
                                const fileExt = file.name.split('.').pop();
                                const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
                                const filePath = `${fileName}`;

                                // 1. Upload to Supabase Storage 'avatars' bucket
                                const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
                                if (uploadError) throw uploadError;

                                // 2. Get Public URL
                                const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

                                // 3. Update User Metadata
                                const { error: updateError } = await supabase.auth.updateUser({
                                    data: { avatar_url: publicUrl }
                                });
                                if (updateError) throw updateError;

                                window.location.reload(); // Simple reload to show new image
                            } catch (error: any) {
                                alert('Erro ao enviar foto: Verifique se o Bucket "avatars" existe no Supabase e é público.\n' + error.message);
                            }
                        }}
                    />
                    <div className="flex flex-col text-white">
                        <h2 className="text-xl font-bold mb-1">{user?.user_metadata?.full_name || 'Visitante'}</h2>
                        <p className="text-white/80 text-sm">{user?.user_metadata?.phone || 'Sem telefone'}</p>
                        <p className="text-white/60 text-xs mt-1">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="px-4 space-y-4 -mt-0 pt-6">

                {/* History Card - FUNCTIONAL */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Histórico Real</h3>
                        <Calendar size={20} className="text-gray-400" />
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {appointments.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-4">Nenhum agendamento ainda.</p>
                        ) : (
                            appointments.map((apt, index) => (
                                <div key={index} className="flex justify-between items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{getServiceName(apt.service_id)}</p>
                                        <p className="text-xs text-green-600 font-medium capitalize">
                                            {format(parseISO(apt.start_time), "dd 'de' MMMM", { locale: ptBR })}
                                        </p>
                                        <p className="text-xs text-gray-400">Jacaré do Corte</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-900 font-bold bg-gray-100 px-2 py-1 rounded">
                                            {format(parseISO(apt.start_time), "HH:mm")}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1 capitalize">{apt.status}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Payment Methods Card - ADDED PIX */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Formas de Pagamento</h3>
                        <CreditCard size={20} className="text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        {/* Pix Option */}
                        <div
                            onClick={() => setSelectedPayment('pix')}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedPayment === 'pix'
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30'
                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedPayment === 'pix'
                                    ? 'bg-green-200 text-green-700'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    }`}>
                                    <QrCode size={16} />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">Pix (Instantâneo)</span>
                                    <span className="text-xs text-green-600 dark:text-green-400">Recomendado</span>
                                </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPayment === 'pix'
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300 dark:border-gray-500'
                                }`}>
                                {selectedPayment === 'pix' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                        </div>

                        {/* Credit Card Option */}
                        <div
                            onClick={() => setSelectedPayment('card')}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedPayment === 'card'
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30'
                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedPayment === 'card'
                                    ? 'bg-green-200 text-green-700'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    }`}>
                                    <CreditCard size={16} />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">Cartão de Crédito</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Pagamento na loja</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                                    Presencial
                                </span>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPayment === 'card'
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-gray-300 dark:border-gray-500'
                                    }`}>
                                    {selectedPayment === 'card' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* App Settings Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Configurações</h3>
                    <div className="space-y-4">
                        <div
                            onClick={() => navigate('/settings')}
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                        >
                            <Settings size={20} className="text-gray-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Preferências</p>
                            </div>
                        </div>

                        {/* Admin Access Button - ONLY VISIBLE TO OWNER */}
                        {user?.email === 'viciowins@gmail.com' && (
                            <div
                                onClick={() => navigate('/admin')}
                                className="flex items-center gap-3 pt-2 border-t border-gray-50 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded transition-colors"
                            >
                                <div className="w-5 h-5 rounded bg-gray-900 flex items-center justify-center text-white">
                                    <Settings size={12} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Painel do Dono</p>
                                    <p className="text-[10px] text-gray-500">Acesso restrito</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
