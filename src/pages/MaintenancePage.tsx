import { useAuth } from '../contexts/AuthContext';

export function MaintenancePage() {
    const { signOut } = useAuth();

    return (
        <div className="min-h-screen bg-[#1F2937] flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-8 animate-bounce">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="40" fill="#D4AF3720" />
                    <path d="M40 20v24M40 52v4" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
                </svg>
            </div>

            <h1 className="text-3xl font-black text-white mb-3">
                Em Manutenção
            </h1>
            <p className="text-white/60 text-base max-w-xs leading-relaxed mb-10">
                O Jacaré do Corte está temporariamente fora do ar para melhorias.
                Voltamos em breve! 🐊✂️
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5 mb-10">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Informações</p>
                <p className="text-[#D4AF37] font-bold text-sm">WhatsApp: (41) 99990-4961</p>
            </div>

            <button
                onClick={signOut}
                className="text-white/30 text-sm hover:text-white/60 transition-colors"
            >
                Sair da conta
            </button>
        </div>
    );
}
