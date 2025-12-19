import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '../layouts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Barber {
    id: string;
    name: string;
    avatar_url: string;
    specialty: string;
}

interface Service {
    id: string;
    name: string;
    price: number;
    description: string;
}

export function SchedulePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');

    // Initial Data Fetch
    useEffect(() => {
        async function fetchData() {
            try {
                const { data: barbersData } = await supabase.from('barbers').select('*');
                const { data: servicesData } = await supabase.from('services').select('*');

                if (barbersData) setBarbers(barbersData);
                if (servicesData) setServices(servicesData);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Format currency
    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    // Handle Booking
    const handleBooking = async () => {
        if (!selectedService || !selectedBarber || !selectedDate || !selectedTime || !user) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        setSubmitting(true);

        try {
            // Create timestamp (Combining Date and Time roughly for storage)
            // In a real app, we'd handle timezones carefully.
            const start_time = `${selectedDate}T${selectedTime}:00`;

            const { error } = await supabase.from('appointments').insert({
                user_id: user.id,
                barber_id: selectedBarber.id,
                service_id: selectedService.id,
                start_time: start_time,
                status: 'scheduled'
            });

            if (error) throw error;

            navigate('/booking-success', {
                state: {
                    service: selectedService.name,
                    barber: selectedBarber.name,
                    date: new Date(selectedDate).toLocaleDateString('pt-BR'),
                    time: selectedTime
                }
            });

        } catch (error: any) {
            alert("Erro ao agendar: " + (error.message || "Tente novamente."));
        } finally {
            setSubmitting(false);
        }
    };

    // Generate next 7 days for calendar
    const getNextDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            days.push({
                dateStr: d.toISOString().split('T')[0], // YYYY-MM-DD
                dayNum: d.getDate(),
                dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '')
            });
        }
        return days;
    };

    const calendarDays = getNextDays();

    // Mock time slots
    const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

    if (loading) {
        return (
            <AppLayout title="Novo Agendamento" showBack>
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout title="Novo Agendamento" showBack={true}>
            <div className="flex flex-col h-full bg-gray-50">
                <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">

                    {/* Service Section */}
                    <section className="bg-white rounded-xl p-4 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 px-1">Escolha o Serviço</h3>
                        <div className="space-y-3">
                            {services.length === 0 && <p className="text-gray-500 text-sm">Nenhum serviço disponível.</p>}

                            {services.map(service => (
                                <label key={service.id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${selectedService?.id === service.id ? 'bg-primary/5 border-primary' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
                                    <div>
                                        <p className="font-bold text-gray-900">{service.name}</p>
                                        <p className="text-gray-500 text-sm">{formatPrice(service.price)} • {service.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="service"
                                            className="w-5 h-5 accent-primary"
                                            checked={selectedService?.id === service.id}
                                            onChange={() => setSelectedService(service)}
                                        />
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Professional Section */}
                    <section className="bg-white rounded-xl p-4 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 px-1">Escolha o Profissional</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {barbers.map(barber => (
                                <label key={barber.id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${selectedBarber?.id === barber.id ? 'bg-primary/5 border-primary' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
                                    <div className="flex items-center gap-3">
                                        <img src={barber.avatar_url || "https://i.pravatar.cc/150"} alt={barber.name} className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                                        <span className="font-bold text-sm text-gray-800">{barber.name}</span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="barber"
                                        className="w-4 h-4 accent-primary"
                                        checked={selectedBarber?.id === barber.id}
                                        onChange={() => setSelectedBarber(barber)}
                                    />
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Date & Time Section */}
                    <section className="bg-white rounded-xl p-4 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 px-1">Data e Hora</h3>

                        {/* Horizontal Calendar */}
                        <div className="flex overflow-x-auto gap-3 pb-4 mb-2 no-scrollbar">
                            {calendarDays.map(day => (
                                <button
                                    key={day.dateStr}
                                    onClick={() => setSelectedDate(day.dateStr)}
                                    className={`flex flex-col items-center min-w-[60px] p-3 rounded-2xl transition-all border ${selectedDate === day.dateStr ? 'bg-primary text-white shadow-md border-primary' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                                >
                                    <span className="text-[10px] font-bold tracking-wider">{day.dayName}</span>
                                    <span className="text-xl font-bold">{day.dayNum}</span>
                                </button>
                            ))}
                        </div>

                        {/* Time Slots */}
                        <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-2 px-1 rounded-full text-sm font-semibold border transition-all ${selectedTime === time ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Action Button */}
                    <button
                        onClick={handleBooking}
                        disabled={submitting}
                        className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-4 hover:bg-primary-light transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : 'Confirmar Agendamento'}
                    </button>

                </div>
            </div>
        </AppLayout>
    );
}
