import { AppLayout, AuthLayout } from '../layouts';
import { ChevronLeft, ChevronRight, Check, MessageSquare, AlertTriangle, Shield, Info, Bell, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Auth Related Screens ---

export function OTPVerificationPage() {
    return (
        <AuthLayout>
            <div className="bg-primary p-4 text-white flex items-center gap-4">
                <Link to="/register"><ChevronLeft /></Link>
                <h1 className="font-bold text-lg">Verificação</h1>
            </div>
            <div className="flex-1 flex flex-col items-center p-8 text-center pt-16">
                <div className="w-32 h-32 bg-primary rounded-full mb-8 flex items-center justify-center border-4 border-secondary shadow-xl text-white text-4xl">
                    🐊
                </div>
                <h2 className="text-2xl font-bold text-text mb-2">Verifique seu E-mail</h2>
                <p className="text-text-muted mb-8">
                    Enviamos um código de 6 dígitos para <br />
                    <span className="font-semibold text-text">usuário@email.com</span>
                </p>

                <div className="flex gap-2 mb-8 justify-center">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <input key={i} type="text" maxLength={1} className="w-12 h-14 border border-gray-300 rounded-lg text-center text-xl font-bold focus:border-primary outline-none bg-gray-50" />
                    ))}
                </div>

                <button className="btn-primary w-full mb-4">Confirmar Código</button>
                <button className="text-text-muted text-sm hover:text-primary">Reenviar código</button>
            </div>
        </AuthLayout>
    );
}

export function PasswordResetSuccessPage() {
    return (
        <AuthLayout>
            <div className="bg-primary h-1/2 flex items-center justify-center text-white p-8 relative overflow-hidden">
                <div className="text-center z-10">
                    <h1 className="text-2xl font-bold mb-8">Senha Redefinida!</h1>
                    <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Check size={64} className="text-white" strokeWidth={4} />
                    </div>
                </div>
            </div>
            <div className="p-8 text-center pt-12">
                <h2 className="text-xl font-bold mb-4">Sua senha foi redefinida com sucesso!</h2>
                <p className="text-text-muted mb-8">Agora você pode acessar sua conta com a nova senha.</p>
                <Link to="/login" className="btn-primary w-full">Ir para Login</Link>
            </div>
        </AuthLayout>
    )
}

// --- App Info & Settings Screens ---

export function AboutAppPage() {
    return (
        <AppLayout title="Sobre o App" showBack showSettings>
            <div className="p-6 text-center">
                <div className="w-24 h-24 bg-primary rounded-full mb-6 flex items-center justify-center border-4 border-secondary shadow-lg mx-auto text-white text-3xl">
                    🐊
                </div>
                <h2 className="text-xl font-bold mb-1">Jacaré do Corte</h2>
                <p className="text-text-muted text-sm mb-8">Versão 1.0.0</p>

                <div className="space-y-6 text-left">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold mb-2">Versão</h3>
                        <p className="text-sm text-text-muted leading-relaxed">
                            O aplicativo oficial da Barbearia Jacaré do Corte, trazendo estilo e praticidade para o seu dia a dia.
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold mb-2">Desenvolvedor</h3>
                        <p className="text-sm text-text-muted leading-relaxed">
                            Desenvolvido com tecnologia de ponta para garantir a melhor experiência de agendamento.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export function SettingsPage() {
    return (
        <AppLayout title="Configurações" showBack>
            <div className="p-4 space-y-4">

                {/* Section: Geral */}
                <div className="card">
                    <h3 className="text-sm font-bold text-text-muted uppercase mb-4 tracking-wider">Geral</h3>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Bell size={20} className="text-gray-500" />
                            <div>
                                <p className="font-medium">Notificações</p>
                                <p className="text-xs text-text-muted">Lembretes de agendamento</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                            <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Section: Customização */}
                <div className="card">
                    <h3 className="text-sm font-bold text-text-muted uppercase mb-4 tracking-wider">Aparência</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Moon size={20} className="text-gray-500" />
                            <div>
                                <p className="font-medium">Modo Escuro</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                            <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Section: Privacidade */}
                <div className="card space-y-4">
                    <h3 className="text-sm font-bold text-text-muted uppercase mb-2 tracking-wider">Privacidade</h3>
                    <Link to="/privacy" className="flex items-center justify-between py-2">
                        <span className="font-medium">Política de Privacidade</span>
                        <ChevronRight size={20} className="text-gray-400" />
                    </Link>
                    <div className="h-px bg-gray-100"></div>
                    <Link to="/terms" className="flex items-center justify-between py-2">
                        <span className="font-medium">Termos de Uso</span>
                        <ChevronRight size={20} className="text-gray-400" />
                    </Link>
                </div>

                <button className="btn-outline border-red-200 text-red-600 hover:bg-red-50 mt-8">
                    Sair da Conta
                </button>
            </div>
        </AppLayout>
    )
}

export function SupportPage() {
    return (
        <AppLayout title="Ajuda e Suporte" showBack showSettings>
            <div className="p-4 flex flex-col items-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    <Shield size={40} />
                </div>
                <h2 className="font-bold text-xl mb-1">Como podemos ajudar?</h2>

                <div className="w-full space-y-3 mt-8">
                    <button className="card w-full flex items-center gap-4 hover:border-primary transition-colors text-left p-4">
                        <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
                            <Info size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm">Perguntas Frequentes</h3>
                            <p className="text-xs text-text-muted">Tire suas dúvidas rápidas</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>

                    <button className="card w-full flex items-center gap-4 hover:border-primary transition-colors text-left p-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
                            <MessageSquare size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm">Chat com Suporte</h3>
                            <p className="text-xs text-text-muted">Fale com um atendente</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>

                    <button className="card w-full flex items-center gap-4 hover:border-primary transition-colors text-left p-4">
                        <div className="w-10 h-10 bg-red-100 text-red-700 rounded-lg flex items-center justify-center">
                            <AlertTriangle size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm">Reportar Problema</h3>
                            <p className="text-xs text-text-muted">Algo não está funcionando?</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>
                </div>
            </div>
        </AppLayout>
    )
}

export function SuccessBookingPage() {
    return (
        <AppLayout title="Agendamento Confirmado" showBack>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-40 h-40 bg-secondary rounded-full flex items-center justify-center mb-8 shadow-xl animate-bounce">
                    <Check size={80} className="text-white" strokeWidth={5} />
                </div>

                <h2 className="text-2xl font-bold text-primary mb-2">Agendamento<br />Realizado!</h2>

                <div className="card w-full mt-8 bg-gray-50 text-left">
                    <div className="py-2 border-b border-gray-200">
                        <p className="text-xs text-text-muted uppercase font-bold">Serviço</p>
                        <p className="font-medium">Corte + Barba</p>
                    </div>
                    <div className="py-2 border-b border-gray-200 mt-2">
                        <p className="text-xs text-text-muted uppercase font-bold">Profissional</p>
                        <p className="font-medium">Sr. Zeca</p>
                    </div>
                    <div className="py-2 mt-2">
                        <p className="text-xs text-text-muted uppercase font-bold">Data e Hora</p>
                        <p className="font-medium">5 de Dezembro, 2025 - 09:00</p>
                    </div>
                </div>

                <button className="btn-primary w-full mt-8">Adicionar ao Calendário</button>
                <Link to="/home" className="btn-outline w-full mt-4">Voltar ao Início</Link>
            </div>
        </AppLayout>
    )
}
