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

    const [selectedServiceId, setSelectedServiceId] = useState<string | number | null>(null);
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
                { id: 1, name: 'Corte de Cabelo', price: 40 },
                { id: 2, name: 'Barba', price: 30 },
                { id: 3, name: 'Corte + Barba', price: 65 }
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

    async function handleBooking() {
        if (!user) {
            alert('Você precisa estar logado para agendar.');
            return;
        }
        if (!selectedServiceId || !selectedBarberId || !selectedDate || !selectedTime) {
            alert('Por favor, preencha todos os campos do agendamento.');
            return;
        }

        setLoading(true);

        try {
            // Construct timestamp for current month/year
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const dateStr = `${year}-${month}-${selectedDate.toString().padStart(2, '0')}`;
            const startTime = `${dateStr}T${selectedTime}:00`;

            const { error } = await supabase
                .from('appointments')
                .insert([
                    {
                        user_id: user.id,
                        service_id: selectedServiceId,
                        barber_id: selectedBarberId,
                        start_time: startTime,
                        status: 'scheduled'
                    }
                ]);

            if (error) throw error;

            const selectedService = services.find(s => s.id === selectedServiceId);
            const selectedBarber = barbers.find(b => b.id === selectedBarberId);

            navigate('/booking-success', {
                state: {
                    serviceName: selectedService?.name,
                    barberName: selectedBarber?.name,
                    date: startTime
                }
            });
        } catch (error) {
            console.error('Erro ao agendar:', error);

            // Fallback: Save to Local Mock DB (Offline Mode)
            const selectedService = services.find(s => s.id === selectedServiceId);
            const selectedBarber = barbers.find(b => b.id === selectedBarberId);

            // Reconstruct time
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const dateStr = `${year}-${month}-${selectedDate.toString().padStart(2, '0')}`;
            const startTime = `${dateStr}T${selectedTime}:00`;

            MockDB.addAppointment({
                user_id: user?.id || 'offline-user',
                start_time: startTime,
                status: 'scheduled',
                services: selectedService,
                barbers: selectedBarber,
            });

            // alert('Modo Offline: Agendamento salvo localmente.');


            navigate('/booking-success', {
                state: {
                    serviceName: selectedService?.name,
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
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Escolha o Serviço</h2>

                    {/* Group 1: Cabelo/Barba */}
                    <div className="relative mb-4">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-[#2E5C38] text-sm">Barba</span>
                            <div className="w-8 h-8 rounded-full bg-[#2E5C38] flex items-center justify-center text-white shadow-sm">
                                <Scissors size={16} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {services.filter(s => s.name.toLowerCase().includes('corte de cabelo') || s.name === 'Barba').map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedServiceId(service.id)}
                                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg py-1 transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{service.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatPrice(service.price)}</span>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedServiceId === service.id ? 'border-[#2E5C38]' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {selectedServiceId === service.id && <div className="w-2 h-2 rounded-full bg-[#2E5C38]" />}
                                    </div>
                                </div>
                            ))}
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
                            {services.filter(s => !s.name.toLowerCase().includes('corte de cabelo') && s.name !== 'Barba').map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedServiceId(service.id)}
                                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg py-1 transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{service.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatPrice(service.price)}</span>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedServiceId === service.id ? 'border-[#2E5C38]' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {selectedServiceId === service.id && <div className="w-2 h-2 rounded-full bg-[#2E5C38]" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {services.length === 0 && !loading && <span className="text-gray-500 text-sm">Nenhum serviço disponível.</span>}
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
                    <span className="text-[10px] font-medium tracking-wide opacity-80">Inicio</span>
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
