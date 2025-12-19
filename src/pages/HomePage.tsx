import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
    id: string;
    start_time: string;
    end_time?: string;
    status: string;
    barbers: { name: string; avatar_url: string };
    services: { name: string; price: number; duration_minutes: number };
}

export function HomePage() {
    const navigate = useNavigate();
    const { session } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user.id) {
            loadAppointments();
        }
    }, [session]);

    const loadAppointments = async () => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          id,
          start_time,
          status,
          barbers (name, avatar_url),
          services (name, price, duration_minutes)
        `)
                .eq('user_id', session?.user.id)
                .order('start_time', { ascending: true });

            if (error) throw error;
            setAppointments((data as any) || []);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const handleViewDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Deseja realmente cancelar este agendamento?')) return;
        try {
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadAppointments(); // Reload list
        } catch (error) {
            console.error('Error canceling appointment:', error);
            alert('Erro ao cancelar agendamento.');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F7] pb-24 relative">
            {/* Header */}
            <div className="bg-[#2E5C38] pt-12 p-6 flex flex-col items-center relative z-10">
                <div className="w-full flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-[#D4AF37] text-lg font-bold uppercase tracking-wider">Jacaré do Corte</h1>
                    <button onClick={() => navigate('/settings')} className="text-white">
                        <Settings size={24} />
                    </button>
                </div>

                <div className="w-40 h-40 bg-black rounded-full border-[4px] border-[#D4AF37] flex items-center justify-center overflow-hidden shadow-xl mb-6">
                    <img src="/logo_jacare.jpg" alt="Jacaré do Corte" className="w-full h-full object-cover scale-110" />
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 bg-white rounded-t-[30px] -mt-6 relative z-20 px-6 pt-8 pb-20 shadow-[-10px_-10px_30px_rgba(0,0,0,0.1)]">
                <h2 className="text-center text-xl font-bold text-gray-900 mb-6">Meus Agendamentos</h2>

                {loading ? (
                    <div className="text-center text-gray-500 py-10">Carregando...</div>
                ) : appointments.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">Nenhum agendamento encontrado.</div>
                ) : (
                    <div className="space-y-4 mb-8">
                        {appointments.map((apt, index) => (
                            <div key={apt.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm flex relative overflow-hidden">
                                {/* Green Strip */}
                                <div className={`w-3 ${index === 0 ? 'bg-[#2E5C38]' : 'bg-transparent'} h-full absolute left-0 top-0`}></div>

                                <div className="flex-1 p-4 pl-6 relative">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                                                {format(new Date(apt.start_time), "EEEE, HH:mm", { locale: ptBR }).toUpperCase()}
                                            </p>
                                            <p className="text-base font-bold text-gray-900 mt-1 leading-tight">{apt.services.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">Com {apt.barbers.name}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-sm rotate-90 text-gray-500">✂️</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-2">
                                        {/* Mocking logic: First one is upcoming/cancellable, second is completed/details */}
                                        {index === 0 ? (
                                            <button
                                                onClick={() => handleCancel(apt.id)}
                                                className="bg-[#2E5C38] text-white text-[10px] font-bold py-1.5 px-4 rounded-full hover:bg-[#1E3F24] transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleViewDetails(apt)}
                                                className="bg-gray-500 text-white text-[10px] font-bold py-1.5 px-4 rounded-full hover:bg-gray-600 transition-colors"
                                            >
                                                Ver Detalhes
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={() => navigate('/agendar')}
                    className="w-full bg-[#2E5C38] border-2 border-[#D4AF37] text-white font-bold h-14 rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-[#1E3F24] transition-all text-lg"
                >
                    + Novo Agendamento
                </button>
            </div>

            {/* Details Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setSelectedAppointment(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50"
                        >
                            ✕
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Detalhes do Agendamento</h3>
                            <p className="text-sm text-gray-500 mt-1">Código: #{selectedAppointment.id.slice(0, 8)}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <div className="w-12 h-12 bg-[#2E5C38] rounded-full flex items-center justify-center text-white shrink-0">
                                    <span className="text-xl">📅</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Data e Hora</p>
                                    <p className="text-gray-900 font-bold capitalize">
                                        {format(new Date(selectedAppointment.start_time), "EEEE, d 'de' MMMM", { locale: ptBR })}
                                    </p>
                                    <p className="text-gray-900 font-bold">
                                        às {format(new Date(selectedAppointment.start_time), "HH:mm")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-white shrink-0">
                                    <span className="text-xl">✂️</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Serviço</p>
                                    <p className="text-gray-900 font-bold">{selectedAppointment.services.name}</p>
                                    <p className="text-sm text-gray-600">
                                        R$ {selectedAppointment.services.price},00 • {selectedAppointment.services.duration_minutes} min
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                    <img src={selectedAppointment.barbers.avatar_url} alt={selectedAppointment.barbers.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Profissional</p>
                                    <p className="text-gray-900 font-bold">{selectedAppointment.barbers.name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="w-full bg-[#2E5C38] text-white font-bold h-12 rounded-xl hover:bg-[#1E3F24] transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
