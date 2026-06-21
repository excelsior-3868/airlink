import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, CreditCard, Ticket, LogOut, Wifi } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

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

    if (!user) return null;

    const navItems = [
        { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
        { label: 'Recharge Voucher', path: '/customer/recharge', icon: CreditCard },
        { label: 'Support Tickets', path: '/customer/tickets', icon: Ticket },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation */}
            <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-white px-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                        <Wifi className="size-5" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-800">Airlink Subscriber Portal</span>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <span className="hidden text-sm text-slate-600 sm:inline">
                        Welcome, <strong className="font-semibold text-slate-900">{user.name || user.username}</strong>
                    </span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                    >
                        <LogOut className="size-4" />
                        Log out
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 gap-6">
                {/* Left/Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                    <div className="bg-white rounded-xl shadow-sm border p-3 flex flex-row md:flex-col gap-1.5 overflow-x-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition whitespace-nowrap ${
                                        active
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon className="size-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[500px]">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b">{title}</h2>
                        {children}
                    </div>
                </main>
            </div>
            <Toaster richColors position="top-right" />
        </div>
    );
}
