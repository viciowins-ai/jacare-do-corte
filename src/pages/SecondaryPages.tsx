import { AppLayout, AuthLayout } from '../layouts';
import { ChevronLeft, ChevronRight, Check, Shield, FileText, HelpCircle, CreditCard } from 'lucide-react';
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
                <div className="w-32 h-32 bg-black rounded-full mb-8 flex items-center justify-center border-[3px] border-secondary shadow-xl overflow-hidden">
                    <img src="/logo_jacare.jpg" alt="Jacaré do Corte" className="w-full h-full object-cover" />
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
                    <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-white/20">
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
                <div className="w-24 h-24 bg-black rounded-full mb-6 flex items-center justify-center border-4 border-secondary shadow-lg mx-auto text-white text-3xl overflow-hidden">
                    <img src="/logo_jacare.jpg" alt="Jacaré do Corte" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-xl font-bold mb-1">Jacaré do Corte</h2>
                <p className="text-text-muted text-sm mb-8">Barbearia Oficial</p>

                <div className="space-y-6 text-left">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold mb-2">Versão 1.0.0</h3>
                        <p className="text-sm text-text-muted leading-relaxed">
                            O aplicativo oficial da Barbearia Jacaré do Corte, trazendo estilo e praticidade para o seu dia a dia.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export function SettingsPage() {
    return (
        <AppLayout title="Configurações do App" showBack>
            <div className="p-4 space-y-4 bg-gray-50 h-full">

                {/* Section: Geral */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Geral</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <p className="font-medium text-gray-800">Notificações</p>
                        </div>
                        <div className="w-12 h-7 bg-primary rounded-full relative cursor-pointer transition-colors">
                            <div className="w-6 h-6 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Section: Aparência */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Configurações</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <p className="font-medium text-gray-800">Modo Escuro</p>
                        </div>
                        <div className="w-12 h-7 bg-white border border-gray-300 rounded-full relative cursor-pointer transition-colors">
                            <div className="w-6 h-6 bg-gray-200 rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Section: Privacidade */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4 space-y-6">
                    <h3 className="text-sm font-bold text-gray-900">Privacidade</h3>

                    <Link to="/privacy" className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <p className="font-medium text-gray-800">Politica de Privacidade</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-300" />
                    </Link>

                    <Link to="/terms" className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <p className="font-medium text-gray-800">Termos de Uso</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-300" />
                    </Link>
                </div>

                <div className="pt-8">
                    <button className="w-40 mx-auto flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-full hover:bg-primary-dark transition-colors text-sm">
                        Sair da Conta
                    </button>
                </div>
            </div>
        </AppLayout>
    )
}

export function SupportPage() {
    return (
        <AppLayout title="Central e Suporte" showBack showSettings>
            <div className="bg-gray-50 h-full flex flex-col">
                {/* Header Logo Area */}
                <div className="bg-white pb-6 pt-2 text-center shadow-sm">
                    <div className="w-24 h-24 bg-black rounded-full mx-auto mb-3 flex items-center justify-center border-[3px] border-secondary overflow-hidden">
                        <img src="/logo_jacare.jpg" alt="Jacaré do Corte" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Jacaré do Corte</h2>
                    <p className="text-gray-500 text-sm">Barbearia Oficial</p>
                </div>

                <div className="p-4 flex-1">
                    <h3 className="font-bold text-gray-800 mb-4 ml-1">Precisa de Ajuda?</h3>

                    <div className="space-y-3">
                        <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                    <HelpCircle size={20} />
                                </div>
                                <span className="font-bold text-sm text-gray-800">Guia Completo do App</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-300" />
                        </button>

                        <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                    <CreditCard size={20} />
                                </div>
                                <span className="font-bold text-sm text-gray-800">Dúvidas sobre Pagamentos</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-300" />
                        </button>

                        <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                    <FileText size={20} />
                                </div>
                                <span className="font-bold text-sm text-gray-800">Recursos de Acessibilidade</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-300" />
                        </button>

                        <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                    <Shield size={20} />
                                </div>
                                <span className="font-bold text-sm text-gray-800">Politicas e Termos</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-300" />
                        </button>
                    </div>
                </div>

                <div className="p-6 text-center text-sm text-gray-400 pb-24">
                    <p>Ainda precisa ou ajuda? Fale Conosco</p>
                </div>
            </div>
        </AppLayout>
    )
}



