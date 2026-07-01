import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, CreditCard, Ticket, LogOut } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from './AppLayout';
import ApplicationLogo from '@/components/ApplicationLogo';
import Footer from '@/components/Footer';

const getColorClasses = (colorName: string) => {
    const colorMap: Record<string, { icon: string; bg: string; border: string }> = {
        sky: { icon: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-500/10 dark:bg-sky-500/20', border: 'border-sky-500/20 dark:border-sky-400/30' },
        emerald: { icon: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', border: 'border-emerald-500/20 dark:border-emerald-400/30' },
        red: { icon: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/10 dark:bg-red-500/20', border: 'border-red-500/20 dark:border-red-400/30' },
    };
    return colorMap[colorName] || { icon: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
};

export default function CustomerLayout({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        if (title) {
            document.title = `${title} | Nepal Airlink`;
        } else {
            document.title = 'Nepal Airlink';
        }
    }, [title]);

    if (!user) return null;

    const navItems = [
        { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard, color: 'sky' },
        { label: 'Recharge Voucher', path: '/customer/recharge', icon: CreditCard, color: 'emerald' },
        { label: 'Support Tickets', path: '/customer/tickets', icon: Ticket, color: 'red' },
    ];

    return (
        <div className="relative min-h-screen bg-transparent text-foreground flex flex-col overflow-hidden">
            {/* Background decorative blobs */}
            <div className="pointer-events-none absolute -left-16 top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-rose-300/5 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan-300/5 blur-3xl" />

            {/* Top Navigation - Styled as Frosted Brand Header */}
            <header className="sticky top-0 z-20 flex h-16 items-center bg-white/70 backdrop-blur-md px-6 shadow-sm border-b dark:bg-slate-950/70 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <ApplicationLogo className="size-6 object-contain text-primary" />
                    </div>
                    <div>
                        <span className="font-heading font-bold text-[#9f230f]">Airlink Subscriber Portal</span>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <ThemeToggle className="hover:bg-primary/10 rounded-xl" />

                    <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                            {(user.name || user.username).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {user.name || user.username}
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5 transition cursor-pointer"
                    >
                        <LogOut className="size-4" />
                        Log out
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 gap-6 z-10">
                {/* Left/Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                    <div className="app-sidebar-panel flex flex-row md:flex-col gap-1.5 p-3 overflow-x-auto rounded-[24px]">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = location.pathname === item.path;
                            const colors = getColorClasses(item.color);
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className={`flex items-center gap-3 rounded-[18px] px-3.5 py-2.5 text-sm font-semibold transition whitespace-nowrap group no-underline ${
                                        active
                                            ? 'app-sidebar-nav-item-active'
                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800/50 dark:hover:text-white'
                                    }`}
                                >
                                    <div className="relative flex size-5 items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110">
                                        <Icon className={`size-4 transition-transform duration-200 ${active ? 'text-current' : colors.icon}`} />
                                    </div>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content Area - Styled as a Frosted Card Panel */}
                <main className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500">
                    <div className="glass-card p-6 sm:p-8 min-h-[500px]">
                        <h2 className="text-2xl font-bold font-heading text-primary dark:text-white mb-6 pb-3 border-b border-border/50">
                            {title}
                        </h2>
                        {children}
                    </div>
                </main>
            </div>

            <div className="border-t border-border/50 bg-white/60 backdrop-blur-md dark:bg-slate-950/60 dark:border-slate-800 mt-auto">
                <Footer />
            </div>

            <Toaster richColors position="top-right" />
        </div>
    );
}
