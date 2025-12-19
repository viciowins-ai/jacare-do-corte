import { User as UserIcon, LogOut, ChevronRight } from 'lucide-react';
import { AppLayout } from '../layouts';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export function ProfilePage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <AppLayout title="Meu Perfil" showSettings>
            <div className="p-6 flex flex-col items-center bg-primary text-white rounded-b-[40px] shadow-lg mb-6 -mt-4 pt-8">
                <div className="w-24 h-24 bg-white rounded-full mb-4 flex items-center justify-center border-4 border-secondary text-primary">
                    <UserIcon size={40} />
                </div>
                <h2 className="text-xl font-bold">{user?.user_metadata?.full_name || 'Usuário'}</h2>
                <p className="opacity-80">{user?.email}</p>
                <div className="flex gap-4 mt-6 w-full justify-center">
                    <div className="text-center">
                        <span className="block font-bold text-xl">0</span>
                        <span className="text-xs opacity-75">Cortes</span>
                    </div>
                    <div className="w-px bg-white/30"></div>
                    <div className="text-center">
                        <span className="block font-bold text-xl">5.0</span>
                        <span className="text-xs opacity-75">Nota</span>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-2">
                {/* Custom Link Logic for Settings and Support */}
                <Link to="/home" className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50">
                    <span className="font-medium">Histórico de Agendamentos</span>
                    <ChevronRight size={20} className="text-gray-400" />
                </Link>
                <Link to="/settings" className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50">
                    <span className="font-medium">Configurações do App</span>
                    <ChevronRight size={20} className="text-gray-400" />
                </Link>
                <Link to="/support" className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50">
                    <span className="font-medium">Ajuda e Suporte</span>
                    <ChevronRight size={20} className="text-gray-400" />
                </Link>

                {/* Removed href="#" to avoid page reload, used button with onClick */}
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-between p-4 bg-red-50 text-red-600 rounded-xl shadow-sm border border-red-100 mt-6 hover:bg-red-100 transition-colors"
                >
                    <span className="font-medium">Sair da Conta</span>
                    <LogOut size={20} />
                </button>
            </div>
        </AppLayout>
    )
}
