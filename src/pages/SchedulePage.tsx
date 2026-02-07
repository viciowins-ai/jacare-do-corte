import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MockDB } from '../lib/mockDb';
import { ArrowLeft, Scissors, User, Monitor, PlayCircle, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Service {
    id: string | number;
    name: string;
    price: number;
    duration_minutes?: number;
}

interface Barber {
    id: string | number;
    name: string;
    avatar_url?: string;
}

export function SchedulePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const [services, setServices] = useState<Service[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);

    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
    const [selectedBarberId, setSelectedBarberId] = useState<string | number | null>(null);
    const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate()); // Day of month
    const [selectedTime, setSelectedTime] = useState<string | null>('09:00');

    // Calendar Data
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startOffset = new Date(currentYear, currentMonth, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            const { data: servicesData, error: servicesError } = await supabase
                .from('services')
                .select('*')
                .order('price', { ascending: true });

            if (servicesError) throw servicesError;
            setServices(servicesData || []);

            const { data: barberData, error: barberError } = await supabase
                .from('barbers')
                .select('*');

            if (barberError) throw barberError;
            setBarbers(barberData || []);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            // Fallback mock data if DB is empty or fails
            setServices([
                { id: 1, name: 'Cabelo', price: 30 },
                { id: 2, name: 'Barba', price: 20 },
                { id: 3, name: 'Barba + Cabelo + Sobrancelha', price: 50 },
                { id: 4, name: 'Sobrancelha', price: 10 },
                { id: 5, name: 'Luzes', price: 130 },
                { id: 6, name: 'Platinado', price: 130 },
                { id: 7, name: 'Reflexo Alinhado', price: 130 }
            ]);
            setBarbers([
                { id: 1, name: 'Jacaré', avatar_url: '/logo_jacare.jpg' }
            ]);
        } finally {
            setLoading(false);
        }
    }

    // Auto-select barber if there's only one
    useEffect(() => {
        if (barbers.length === 1) {
            setSelectedBarberId(barbers[0].id);
        }
    }, [barbers]);

    const toggleService = (id: number) => {
        if (selectedServiceIds.includes(id)) {
            setSelectedServiceIds(prev => prev.filter(sId => sId !== id));
        } else {
            setSelectedServiceIds(prev => [...prev, id]);
        }
    };

    async function handleBooking() {
        const isVisitor = user?.email === 'visitante_v5@jacare.com';

        if (isVisitor) {
            if (confirm('Modo Visitante: Você está visualizando o layout.\n\nPara confirmar esse agendamento, crie sua conta agora!')) {
                // Logout visitor and go to login
                localStorage.removeItem('sb-access-token');
                localStorage.removeItem('sb-refresh-token');
                localStorage.removeItem('demo_mode');
                window.location.href = '/';
            }
            return;
        }

        if (!user) {
            alert('Você precisa estar logado para agendar.');
            return;
        }
        if (selectedServiceIds.length === 0 || !selectedBarberId || !selectedDate || !selectedTime) {
            alert('Por favor, selecione pelo menos um serviço, barbeiro, data e hora.');
            return;
        }

        // --- TRAVA DE PAGAMENTO (FREEMIUM) ---
        const isAdmin = user.email === 'admin@jacare.com' || user.email === 'dono@jacare.com' || user.email === 'araucariainforma@gmail.com' || user.email === 'viciowins@gmail.com';
        const status = MockDB.getUserStatus(user.id);

        if (!isAdmin && status !== 'approved') {
            // Opcional: Mostrar um alerta ou modal antes de redirecionar
            if (confirm("Para realizar agendamentos exclusivos, torne-se um membro do clube!\n\nDeseja ativar sua assinatura agora?")) {
                navigate('/payment');
            }
            return;
        }
        // -------------------------------------

        setLoading(true);

        try {
            // Construct timestamp for current month/year
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const dateStr = `${year}-${month}-${selectedDate.toString().padStart(2, '0')}`;
            const startTime = `${dateStr}T${selectedTime}:00`;

            const selectedBarber = barbers.find(b => b.id === selectedBarberId);
            const selectedServicesList = services.filter(s => selectedServiceIds.includes(s.id as number));

            // Create an array of promises to insert multiple appointments
            const appointmentPromises = selectedServiceIds.map(serviceId =>
                supabase
                    .from('appointments')
                    .insert([
                        {
                            user_id: user.id,
                            service_id: serviceId,
                            barber_id: selectedBarberId,
                            start_time: startTime,
                            status: 'scheduled'
                        }
                    ])
            );

            const results = await Promise.all(appointmentPromises);

            // Check for errors in any of the requests
            const errors = results.filter(r => r.error);
            if (errors.length > 0) throw errors[0].error;

            const serviceNames = selectedServicesList.map(s => s.name).join(' + ');

            navigate('/booking-success', {
                state: {
                    serviceName: serviceNames,
                    barberName: selectedBarber?.name,
                    date: startTime
                }
            });
        } catch (error) {
            console.error('Erro ao agendar:', error);

            // Fallback: Save to Local Mock DB (Offline Mode)
            const selectedBarber = barbers.find(b => b.id === selectedBarberId);
            const selectedServicesList = services.filter(s => selectedServiceIds.includes(s.id as number));

            // Reconstruct time
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const dateStr = `${year}-${month}-${selectedDate.toString().padStart(2, '0')}`;
            const startTime = `${dateStr}T${selectedTime}:00`;

            // For MockDB, we'll iterate too
            selectedServicesList.forEach(service => {
                MockDB.addAppointment({
                    user_id: user?.id || 'offline-user',
                    start_time: startTime,
                    status: 'scheduled',
                    services: service,
                    barbers: selectedBarber,
                });
            });

            const serviceNames = selectedServicesList.map(s => s.name).join(' + ');

            navigate('/booking-success', {
                state: {
                    serviceName: serviceNames,
                    barberName: selectedBarber?.name,
                    date: startTime
                }
            });
        } finally {
            setLoading(false);
        }
    }

    // Helper to format currency
    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] dark:bg-gray-900 pb-24 font-sans transition-colors duration-300">
            {/* Header */}
            <div className="bg-[#2E5C38] pt-12 p-6 pb-8 flex items-center justify-between shadow-none">
                <button onClick={() => navigate('/home')} className="text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-white text-lg font-bold">Novo Agendamento</h1>
                <button
                    onClick={() => navigate('/settings')}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                    <Settings className="text-[#D4AF37]" size={24} />
                </button>
            </div>

            {/* Main Content Card */}
            <div className="flex-1 bg-[#F5F5F7] dark:bg-gray-900 px-4 -mt-4 z-10 space-y-4 transition-colors">

                {/* Services Section */}
                <div className="bg-white dark:bg-gray-800 rounded-[20px] p-5 shadow-sm transition-colors">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Escolha os Serviços (Selecione um ou mais)</h2>

                    {/* Group 1: Cabelo/Barba */}
                    <div className="relative mb-4">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-[#2E5C38] text-sm">Barba & Cabelo</span>
                            <div className="w-8 h-8 rounded-full bg-[#2E5C38] flex items-center justify-center text-white shadow-sm">
                                <Scissors size={16} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {services.filter(s => s.name.toLowerCase().includes('cabelo') || s.name.toLowerCase().includes('barba')).map((service) => {
                                const isSelected = selectedServiceIds.includes(service.id as number);
                                return (
                                    <div
                                        key={service.id}
                                        onClick={() => toggleService(service.id as number)}
                                        className={`flex items-center justify-between cursor-pointer rounded-lg py-2 px-2 transition-all border ${isSelected ? 'bg-green-50 border-[#2E5C38]' : 'hover:bg-gray-50 border-transparent'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${isSelected ? 'text-[#2E5C38]' : 'text-gray-900 dark:text-gray-100'}`}>{service.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatPrice(service.price)}</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#2E5C38] border-[#2E5C38]' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {isSelected && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white rotate-[-45deg] mb-0.5" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-gray-100 mb-4"></div>

                    {/* Group 2: Combos & Outros */}
                    <div className="relative">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-[#2E5C38] text-sm">Outros Serviços</span>
                            <div className="w-8 h-8 rounded-full bg-[#2E5C38] flex items-center justify-center text-white shadow-sm">
                                <Scissors size={16} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {services.filter(s => !s.name.toLowerCase().includes('cabelo') && !s.name.toLowerCase().includes('barba')).map((service) => {
                                const isSelected = selectedServiceIds.includes(service.id as number);
                                return (
                                    <div
                                        key={service.id}
                                        onClick={() => toggleService(service.id as number)}
                                        className={`flex items-center justify-between cursor-pointer rounded-lg py-2 px-2 transition-all border ${isSelected ? 'bg-green-50 border-[#2E5C38]' : 'hover:bg-gray-50 border-transparent'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${isSelected ? 'text-[#2E5C38]' : 'text-gray-900 dark:text-gray-100'}`}>{service.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatPrice(service.price)}</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#2E5C38] border-[#2E5C38]' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {isSelected && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white rotate-[-45deg] mb-0.5" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {services.length === 0 && !loading && <span className="text-gray-500 text-sm">Nenhum serviço disponível.</span>}

                    {/* Total Summary */}
                    {selectedServiceIds.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
                            <span className="text-sm text-gray-500">Total estimado:</span>
                            <span className="text-lg font-bold text-[#2E5C38]">
                                {formatPrice(services.filter(s => selectedServiceIds.includes(s.id as number)).reduce((sum, s) => sum + s.price, 0))}
                            </span>
                        </div>
                    )}
                </div>

                {/* Professionals Section */}
                <div className="bg-white dark:bg-gray-800 rounded-[20px] p-5 shadow-sm transition-colors">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Profissional</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {barbers.map((barber) => (
                            <div
                                key={barber.id}
                                onClick={() => setSelectedBarberId(barber.id)}
                                className="flex items-center justify-between cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <img
                                        src={barber.avatar_url || `https://ui-avatars.com/api/?name=${barber.name}&background=random`}
                                        className="w-6 h-6 rounded-full bg-yellow-100 object-cover"
                                        alt={barber.name}
                                    />
                                    <span className="text-xs font-bold text-gray-900 dark:text-gray-200">{barber.name}</span>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedBarberId === barber.id ? 'border-[#2E5C38]' : 'border-gray-300'}`}>
                                    {selectedBarberId === barber.id && <div className="w-2 h-2 rounded-full bg-[#2E5C38]" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Date & Time Section */}
                <div className="bg-white dark:bg-gray-800 rounded-[20px] p-5 shadow-sm transition-colors">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Escolha a Data e Hora</h2>

                    <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2 capitalize">
                            {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                        </p>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekDays.map((d, i) => <div key={i} className="text-center text-[10px] text-gray-400 font-medium">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                            {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`}></div>)}

                            {days.map((d) => (
                                <div key={d}
                                    onClick={() => setSelectedDate(d)}
                                    className={`h-8 flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors ${selectedDate === d ? 'bg-[#2E5C38] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    {d}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Time Slots */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map((time) => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedTime === time
                                    ? 'bg-[#2E5C38] text-white'
                                    : 'text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 w-full h-[70px] bg-[#2E5C38] rounded-t-[20px] flex items-center justify-between px-8 z-50 shadow-2xl max-w-md mx-auto left-0 right-0">
                <button
                    onClick={() => navigate('/home')}
                    className="flex flex-col items-center justify-center gap-1 text-white/70 hover:text-white transition-colors"
                >
                    <User size={24} strokeWidth={2} />
                    <span className="text-[10px] font-medium tracking-wide opacity-80">Início</span>
                </button>

                <button
                    onClick={handleBooking}
                    disabled={loading}
                    className="flex flex-col items-center justify-center gap-1 text-[#D4AF37] -mt-1 disabled:opacity-50"
                >
                    <div className="flex items-center gap-1.5">
                        <PlayCircle size={18} fill="#D4AF37" className="text-[#2E5C38]" />
                        <span className="text-[11px] font-bold tracking-wide uppercase">Confirmar Agendamento</span>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/perfil')}
                    className="flex flex-col items-center justify-center gap-1 text-white/70 hover:text-white transition-colors"
                >
                    <Monitor size={24} strokeWidth={2} />
                    <span className="text-[10px] font-medium tracking-wide opacity-80">Perfil</span>
                </button>
            </nav>
        </div>
    );
}
