import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User, ChevronLeft, Settings } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
    showSettings?: boolean;
}

export function AppLayout({ children, title, showBack = false, showSettings = false }: LayoutProps) {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Início', path: '/home' },
        { icon: Calendar, label: 'Agendar', path: '/agendar' },
        { icon: User, label: 'Perfil', path: '/perfil' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">
            {/* Header */}
            <header className="bg-primary text-white p-4 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-4">
                    {showBack ? (
                        <Link to={-1 as any} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronLeft size={24} />
                        </Link>
                    ) : (
                        <div className="w-8" /> // Spacer
                    )}
                    <h1 className="text-xl font-bold flex-1 text-center">{title || 'Jacaré do Corte'}</h1>
                    {showSettings ? (
                        <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <Settings size={24} />
                        </button>
                    ) : (
                        <div className="w-8" /> // Spacer
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-20">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="absolute bottom-0 left-0 right-0 bg-primary/95 backdrop-blur-sm text-white border-t border-white/10 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-secondary font-medium' : 'text-white/70 hover:text-white'
                                    }`}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-xs">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative shadow-2xl">
            {children}
        </div>
    );
}
