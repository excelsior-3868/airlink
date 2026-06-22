import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, CreditCard, Ticket, LogOut } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from './AppLayout';
import ApplicationLogo from '@/components/ApplicationLogo';

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
        <div className="min-h-screen bg-slate-50 dark:bg-background text-foreground flex flex-col">
            {/* Top Navigation - Styled as Brand Header */}
            <header className="sticky top-0 z-20 flex h-16 items-center brand-header px-4 shadow-sm border-b">
                <div className="flex items-center gap-2">
                    <ApplicationLogo className="size-8 object-contain brightness-0 invert" />
                    <div>
                        <span className="font-bold text-white">Airlink Subscriber Portal</span>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <ThemeToggle />

                    <span className="hidden text-sm text-white/90 sm:inline">
                        Welcome, <strong className="font-semibold text-white">{user.name || user.username}</strong>
                    </span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition cursor-pointer"
                    >
                        <LogOut className="size-4" />
                        Log out
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 gap-6">
                {/* Left/Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                    <div className="bg-white dark:bg-card rounded-xl shadow-sm border p-3 flex flex-row md:flex-col gap-1.5 overflow-x-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = location.pathname === item.path;
                            const colors = getColorClasses(item.color);
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition whitespace-nowrap group ${
                                        active
                                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                                            : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                    }`}
                                >
                                    <div className="relative flex size-5 items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110">
                                        <Icon className={`size-4 transition-transform duration-200 ${colors.icon}`} />
                                    </div>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col gap-6">
                    <div className="bg-white dark:bg-card rounded-xl shadow-sm border p-6 min-h-[500px]">
                        <h2 className="text-xl font-bold text-primary mb-6 pb-2 border-b">{title}</h2>
                        {children}
                    </div>
                </main>
            </div>

            <footer className="border-t bg-background py-4 w-full mt-auto">
                <div className="container mx-auto px-6 flex flex-col items-center justify-center gap-1.5 text-sm text-muted-foreground">
                    <p className="text-center font-medium">
                        &copy; {new Date().getFullYear()} Nepal Airlink. All rights reserved.
                    </p>
                    <p className="text-xs text-center">
                        Developed By: <span className="text-primary font-bold">Netcare Nepal Pvt Ltd</span>
                    </p>
                </div>
            </footer>

            <Toaster richColors position="top-right" />
        </div>
    );
}
