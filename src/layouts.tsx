import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, CalendarPlus, User } from 'lucide-react';
import clsx from 'clsx';

export function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname.startsWith(path);
    const showBottomNav = location.pathname !== '/agendar';

    return (
        <div className="flex flex-col h-screen bg-[#F5F5F7] dark:bg-gray-900 max-w-md mx-auto shadow-2xl overflow-hidden relative transition-colors duration-300">
            {/* Content Area - Increased padding to avoid nav overlap */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-32">
                <Outlet />
            </div>

            {/* Bottom Navigation */}
            {showBottomNav && (
                <nav className="absolute bottom-0 w-full h-[70px] bg-[#2E5C38] rounded-t-[20px] flex items-center justify-around px-2 z-50">
                    <button
                        onClick={() => navigate('/home')}
                        className={clsx(
                            "flex flex-col items-center justify-center w-16 gap-1 safe-active transition-all duration-200",
                            isActive('/home') ? "text-[#D4AF37] translate-y-[-2px]" : "text-white/70 hover:text-white"
                        )}
                    >
                        <Home size={26} strokeWidth={isActive('/home') ? 2.5 : 2} />
                        <span className={clsx("text-[11px] font-medium tracking-wide", isActive('/home') ? "opacity-100" : "opacity-80")}>Início</span>
                    </button>

                    <button
                        onClick={() => navigate('/agendar')}
                        className={clsx(
                            "flex flex-col items-center justify-center w-16 gap-1 safe-active transition-all duration-200",
                            isActive('/agendar') ? "text-[#D4AF37] translate-y-[-2px]" : "text-white/70 hover:text-white"
                        )}
                    >
                        <CalendarPlus size={26} strokeWidth={isActive('/agendar') ? 2.5 : 2} />
                        <span className={clsx("text-[11px] font-medium tracking-wide", isActive('/agendar') ? "opacity-100" : "opacity-80")}>Agendar</span>
                    </button>

                    <button
                        onClick={() => navigate('/perfil')}
                        className={clsx(
                            "flex flex-col items-center justify-center w-16 gap-1 safe-active transition-all duration-200",
                            isActive('/perfil') ? "text-[#D4AF37] translate-y-[-2px]" : "text-white/70 hover:text-white"
                        )}
                    >
                        <User size={26} strokeWidth={isActive('/perfil') ? 2.5 : 2} />
                        <span className={clsx("text-[11px] font-medium tracking-wide", isActive('/perfil') ? "opacity-100" : "opacity-80")}>Perfil</span>
                    </button>
                </nav>
            )}
        </div>
    );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen bg-white max-w-md mx-auto shadow-2xl relative overflow-hidden">
            {children}
        </div>
    );
}
