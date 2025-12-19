
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout, AuthLayout } from './layouts';
import { User as UserIcon, LogOut, ChevronRight, Lock, Mail, Phone } from 'lucide-react';
import {
  OTPVerificationPage,
  PasswordResetSuccessPage,
  AboutAppPage,
  SettingsPage,
  SupportPage,
  SuccessBookingPage
} from './pages/SecondaryPages';

// --- Placeholder Components for Pages ---

// 1. Authentication Pages
function LoginPage() {
  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-primary/5">
        <div className="w-32 h-32 bg-primary rounded-full mb-8 flex items-center justify-center border-4 border-secondary shadow-xl">
          <span className="text-4xl text-white">🐊</span>
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Jacaré do Corte</h2>
        <p className="text-text-muted mb-8 text-center">Seu estilo, no seu tempo.</p>

        <form className="w-full space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input type="email" placeholder="E-mail ou CPF" className="input-field pl-12" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input type="password" placeholder="Senha" className="input-field pl-12" />
          </div>

          <button type="button" className="btn-primary w-full shadow-lg">
            Entrar
          </button>

          <div className="text-center pt-4">
            <span className="text-text-muted">Não tem conta? </span>
            <a href="#/register" className="text-secondary-dark font-semibold hover:underline">Cadastre-se</a>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

function RegisterPage() {
  return (
    <AuthLayout>
      {/* Header for Auth Page */}
      <div className="bg-primary p-4 text-white flex items-center gap-4">
        <a href="#/login"><ChevronRight className="rotate-180" /></a>
        <h1 className="font-bold text-lg">Criar Conta</h1>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-24 h-24 bg-primary rounded-full mb-6 flex items-center justify-center border-4 border-secondary shadow-lg">
          <span className="text-3xl text-white">🐊</span>
        </div>

        <form className="w-full space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input type="text" placeholder="Nome Completo" className="input-field pl-12" />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input type="email" placeholder="E-mail" className="input-field pl-12" />
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input type="tel" placeholder="Celular" className="input-field pl-12" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input type="password" placeholder="Senha" className="input-field pl-12" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input type="password" placeholder="Confirmar Senha" className="input-field pl-12" />
          </div>

          <a href="#/verify-otp" className="btn-primary w-full shadow-lg mt-6 flex items-center justify-center text-center">
            Finalizar Cadastro
          </a>

          <div className="text-center pt-4 pb-8">
            <span className="text-text-muted">Já tem conta? </span>
            <a href="#/login" className="text-secondary-dark font-semibold hover:underline">Entrar</a>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

// 2. Main App Pages
function HomePage() {
  return (
    <AppLayout title="Meus Agendamentos" showSettings>
      <div className="p-4 space-y-4">
        {/* Confirmed Appointment Card */}
        <div className="card border-l-4 border-l-primary">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg text-primary">AMANHÃ, 14:00</h3>
              <p className="text-text font-medium">Corte de Cabelo + Barba</p>
              <p className="text-text-muted text-sm flex items-center gap-1"><UserIcon size={14} /> Com Sr. Zeca</p>
            </div>
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
              CONFIRMADO
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 btn-outline py-2 text-sm bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
              Cancelar
            </button>
          </div>
        </div>

        {/* Another Appointment */}
        <div className="card border-l-4 border-l-secondary">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg text-primary">QUINTA, 18:30</h3>
              <p className="text-text font-medium">Pé + Mão Express</p>
              <p className="text-text-muted text-sm flex items-center gap-1"><UserIcon size={14} /> Com Dona Maria</p>
            </div>
            <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">
              PENDENTE
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 btn-outline py-2 text-sm">
              Ver Detalhes
            </button>
          </div>
        </div>

        <a href="#/agendar" className="btn-primary shadow-xl fixed bottom-24 right-4 rounded-full w-auto px-6 animate-bounce">
          + Novo Agendamento
        </a>
      </div>
    </AppLayout>
  );
}

function SchedulePage() {
  return (
    <AppLayout title="Novo Agendamento" showBack>
      <div className="p-4 space-y-6">
        {/* Services */}
        <section>
          <h3 className="font-bold text-lg mb-3">Escolha o Serviço</h3>
          <div className="space-y-3">
            {['Corte de Cabelo (R$ 40)', 'Barba (R$ 35)', 'Corte + Barba (R$ 65)'].map((service, i) => (
              <label key={i} className="flex items-center justify-between card p-4 cursor-pointer hover:border-primary transition-colors">
                <span className="font-medium">{service}</span>
                <input type="radio" name="service" className="w-5 h-5 accent-primary" />
              </label>
            ))}
          </div>
        </section>

        {/* Professional */}
        <section>
          <h3 className="font-bold text-lg mb-3">Profissional</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {['Sr. Zeca', 'Sr. Mora', 'Dona Maria'].map((prof, i) => (
              <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${i === 0 ? 'border-primary bg-primary/10' : 'border-gray-200 bg-gray-100'}`}>
                  <UserIcon size={24} className={i === 0 ? 'text-primary' : 'text-gray-400'} />
                </div>
                <span className="text-sm font-medium whitespace-nowrap">{prof}</span>
              </div>
            ))}
          </div>
        </section>

        <a href="#/booking-success" className="btn-primary mt-8 flex items-center justify-center text-center">
          Verificar Disponibilidade
        </a>
      </div>
    </AppLayout>
  )
}

function ProfilePage() {
  return (
    <AppLayout title="Meu Perfil" showSettings>
      <div className="p-6 flex flex-col items-center bg-primary text-white rounded-b-[40px] shadow-lg mb-6 -mt-4 pt-8">
        <div className="w-24 h-24 bg-white rounded-full mb-4 flex items-center justify-center border-4 border-secondary text-primary">
          <UserIcon size={40} />
        </div>
        <h2 className="text-xl font-bold">Usuário da Silva</h2>
        <p className="opacity-80">cliente@email.com</p>
        <div className="flex gap-4 mt-6 w-full justify-center">
          <div className="text-center">
            <span className="block font-bold text-xl">12</span>
            <span className="text-xs opacity-75">Cortes</span>
          </div>
          <div className="w-px bg-white/30"></div>
          <div className="text-center">
            <span className="block font-bold text-xl">4.9</span>
            <span className="text-xs opacity-75">Nota</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-2">
        {/* Custom Link Logic for Settings and Support */}
        <a href="#/home" className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50">
          <span className="font-medium">Histórico de Agendamentos</span>
          <ChevronRight size={20} className="text-gray-400" />
        </a>
        <a href="#/settings" className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50">
          <span className="font-medium">Configurações do App</span>
          <ChevronRight size={20} className="text-gray-400" />
        </a>
        <a href="#/support" className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50">
          <span className="font-medium">Ajuda e Suporte</span>
          <ChevronRight size={20} className="text-gray-400" />
        </a>

        <button className="w-full flex items-center justify-between p-4 bg-red-50 text-red-600 rounded-xl shadow-sm border border-red-100 mt-6">
          <span className="font-medium">Sair da Conta</span>
          <LogOut size={20} />
        </button>
      </div>
    </AppLayout>
  )
}


export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OTPVerificationPage />} />
        <Route path="/reset-success" element={<PasswordResetSuccessPage />} />

        {/* App Routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/agendar" element={<SchedulePage />} />
        <Route path="/perfil" element={<ProfilePage />} />

        {/* Secondary Routes */}
        <Route path="/about" element={<AboutAppPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/booking-success" element={<SuccessBookingPage />} />
      </Routes>
    </HashRouter>
  );
}
