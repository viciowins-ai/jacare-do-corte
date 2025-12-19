import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Calendar, Loader2 } from 'lucide-react';
import { AppLayout } from '../layouts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
    id: string;
    start_time: string;
    status: string;
    barbers: { name: string } | null;
    services: { name: string } | null;
}

export function HomePage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAppointments() {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select(`
            id,
            start_time,
            status,
            barbers (name),
            services (name)
          `)
                    .eq('user_id', user.id)
                    .eq('status', 'scheduled') // Only show scheduled ones
                    .order('start_time', { ascending: true });

                if (error) throw error;
                setAppointments(data as any || []);
            } catch (err) {
                console.error('Error fetching appointments:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchAppointments();
    }, [user]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' }).toUpperCase();
        const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return { day, time };
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Deseja realmente cancelar este agendamento?')) return;

        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', id);

            if (error) throw error;

            // Remove from list locally
            setAppointments(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error(error);
            alert('Erro ao cancelar.');
        }
    };

    return (
        <AppLayout title="JACARÉ DO CORTE" showSettings={true}>
            <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className="flex justify-center py-6">
                    <div className="w-32 h-32 bg-black rounded-full border-[3px] border-secondary flex items-center justify-center shadow-lg overflow-hidden">
                        <img src="/logo_jacare.jpg" alt="Jacaré do Corte" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Title Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 text-center mx-4">
                    <h2 className="text-xl font-bold text-text">Meus Agendamentos</h2>
                    {loading && <Loader2 className="animate-spin mx-auto mt-2 text-primary" size={20} />}
                </div>

                {/* Appointments List */}
                <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-24">

                    {!loading && appointments.length === 0 && (
                        <div className="text-center py-10 opacity-60">
                            <Calendar size={48} className="mx-auto mb-2 text-gray-400" />
                            <p>Você não tem agendamentos futuros.</p>
                        </div>
                    )}

                    {appointments.map(app => {
                        const { day, time } = formatDate(app.start_time);
                        return (
                            <div key={app.id} className="bg-white rounded-xl shadow-sm p-5 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-text text-sm">{day}, {time}</h3>
                                        <p className="font-semibold text-text mt-1 text-lg">{(app.services as any)?.name}</p>
                                        <p className="text-text-muted text-sm">Com {(app.barbers as any)?.name}</p>
                                    </div>
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <Scissors className="text-green-700" size={20} />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => handleCancel(app.id)}
                                        className="bg-white border border-gray-200 text-red-500 text-xs font-bold py-2 px-6 rounded-full hover:bg-red-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                                <div className="absolute left-0 top-4 bottom-4 w-1.5 bg-primary rounded-r-md"></div>
                            </div>
                        );
                    })}

                    {/* New Appointment Button */}
                    <Link to="/agendar" className="w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg flex items-center justify-center gap-2 mt-6 border-2 border-secondary hover:bg-primary-light transition-all active:scale-95">
                        <span className="text-xl">+</span> Novo Agendamento
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
