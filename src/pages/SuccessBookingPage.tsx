import { useLocation, Link, Navigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { AppLayout } from '../layouts';

export function SuccessBookingPage() {
    const location = useLocation();
    const state = location.state as { service: string; barber: string; date: string; time: string } | null;

    if (!state) {
        return <Navigate to="/home" replace />;
    }

    return (
        <AppLayout title="Agendamento Confirmado" showBack>
            <div className="flex flex-col h-full bg-primary relative overflow-hidden">
                {/* Decorative Confetti */}
                <div className="absolute top-10 left-10 w-2 h-2 bg-secondary rounded-full opacity-50"></div>
                <div className="absolute top-20 right-20 w-3 h-3 bg-white rounded-full opacity-30"></div>
                <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-secondary rounded-full opacity-60"></div>

                <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full mb-20">

                    {/* Circle Check */}
                    <div className="w-32 h-32 rounded-full border-[6px] border-secondary flex items-center justify-center mb-[-50px] z-20 bg-primary shadow-2xl">
                        <Check size={60} className="text-secondary" strokeWidth={5} />
                    </div>

                    {/* White Card */}
                    <div className="bg-white w-full rounded-2xl pt-16 pb-8 px-6 text-center shadow-2xl">
                        <h2 className="text-2xl font-bold text-text mb-8 leading-tight">Agendamento<br />Realizado!</h2>

                        <div className="text-left space-y-3">
                            <div>
                                <p className="font-bold text-text">Serviço: <span className="font-normal text-text-muted">{state.service}</span></p>
                            </div>
                            <div>
                                <p className="font-bold text-text">Profissional: <span className="font-normal text-text-muted">{state.barber}</span></p>
                            </div>
                            <div>
                                <p className="font-bold text-text text-sm">Data e Hora: <span className="font-normal text-text-muted">{state.date} às {state.time}</span></p>
                            </div>
                        </div>

                        <Link to="/home" className="block w-full bg-primary text-white font-bold py-3 rounded-full mt-10 shadow-lg border border-secondary hover:bg-primary-dark transition-colors text-center">
                            Voltar ao Início
                        </Link>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
