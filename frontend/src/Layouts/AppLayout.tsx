import { AppSidebar } from '@/components/AppSidebar';
import { Toaster } from '@/components/ui/sonner';
import { useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Globe,
    Receipt,
    Flame,
    Package,
    Network,
    Tag,
    Share2,
    Server,
    Database,
    Link as LinkIcon,
    Terminal,
    Clock,
    Lock,
    Wallet,
    FileBarChart,
    Mail,
    AlertTriangle,
    Download,
    Folder,
    MapPin,
    UserCog,
    Sliders,
    CalendarDays,
    Sun,
    Moon,
    Menu,
    X
} from 'lucide-react';
import { type PropsWithChildren, type ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/Footer';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { formatBilingualDate } from '@/lib/date';

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                "relative size-9 rounded-md text-foreground hover:bg-accent active:scale-95 transition-all overflow-hidden cursor-pointer border-none bg-transparent",
                className
            )}
            title="Toggle theme"
        >
            <span className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-300",
                isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
            )}>
                <Sun className="h-5 w-5 text-[#E6B646]" />
            </span>
            <span className={cn(
                "absolute inset-y-0 inset-x-0 flex items-center justify-center transition-all duration-300",
                isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
            )}>
                <Moon className="h-5 w-5 text-indigo-500" />
            </span>
        </button>
    );
}

const getPageMeta = (title: string, path: string) => {
    const t = title.toLowerCase();
    const p = path.toLowerCase();

    if (t.includes('dashboard') || p.includes('dashboard')) {
        return { subtitle: 'Operational Overview: Real-Time System Performance', icon: LayoutDashboard };
    }
    if (t.includes('pppoe user') || p.includes('pppoe')) {
        return { subtitle: 'Manage PPPoE broadband connections and active accounts', icon: Globe };
    }
    if (t.includes('billing') || t.includes('invoice') || p.includes('billing')) {
        return { subtitle: 'View billing histories, invoice listings, and payments', icon: Receipt };
    }
    if (t.includes('customer') || t.includes('user details') || p.includes('customer')) {
        return { subtitle: 'Manage subscriber profiles, accounts, and details', icon: Users };
    }
    if (t.includes('hotspot plan')) {
        return { subtitle: 'Manage hotspot internet plans and pricing', icon: Flame };
    }
    if (t.includes('pppoe plan')) {
        return { subtitle: 'Manage PPPoE subscription plans and configurations', icon: Globe };
    }
    if (t.includes('plan')) {
        return { subtitle: 'Manage internet plans and packages', icon: Package };
    }
    if (t.includes('bandwidth')) {
        return { subtitle: 'Configure bandwidth profiles and traffic speeds', icon: Network };
    }
    if (t.includes('voucher allocation') || p.includes('vouchers/allocate')) {
        return { subtitle: 'Allocate voucher batches to sellers and POS points', icon: Share2 };
    }
    if (t.includes('voucher') || p.includes('voucher')) {
        return { subtitle: 'Generate, manage, and print hotspot recharge vouchers', icon: Tag };
    }
    if (t.includes('router') || p.includes('router')) {
        return { subtitle: 'Manage NAS routers and network endpoints', icon: Server };
    }
    if (t.includes('pool') || p.includes('pool')) {
        return { subtitle: 'Configure IP pools and address allocations', icon: Database };
    }
    if (t.includes('ip bind') || p.includes('ip-bindings')) {
        return { subtitle: 'Manage IP-MAC bindings and allocations', icon: LinkIcon };
    }
    if (t.includes('nas log') || p.includes('nas/logs')) {
        return { subtitle: 'View system logs and router operational records', icon: Terminal };
    }
    if (t.includes('session') || p.includes('session')) {
        return { subtitle: 'Monitor active RADIUS sessions in real time', icon: Clock };
    }
    if (t.includes('auth log') || p.includes('monitor/logs')) {
        return { subtitle: 'View RADIUS authentication logs and login attempts', icon: Lock };
    }
    if (t.includes('wallet') || p.includes('wallet')) {
        return { subtitle: 'Manage account wallet, balance, and transaction logs', icon: Wallet };
    }
    if (t.includes('report') || p.includes('report')) {
        return { subtitle: 'View billing reports and financial analytics', icon: FileBarChart };
    }
    if (t.includes('message') || p.includes('message')) {
        return { subtitle: 'Send and receive system alerts and notices', icon: Mail };
    }
    if (t.includes('complaint') || t.includes('ticket') || p.includes('ticket')) {
        return { subtitle: 'Track and resolve subscriber complaints and support tickets', icon: AlertTriangle };
    }
    if (t.includes('backup') || p.includes('backup')) {
        return { subtitle: 'Perform database backups and restorations', icon: Download };
    }
    if (t.includes('cms category')) {
        return { subtitle: 'Configure categorization schemas for CMS notices', icon: Folder };
    }
    if (t.includes('cms state')) {
        return { subtitle: 'Configure region states for subscriber routing', icon: MapPin };
    }
    if (t.includes('user') || p.includes('administration/users')) {
        return { subtitle: 'Manage staff accounts, roles, and admin users', icon: UserCog };
    }
    if (t.includes('setting') || p.includes('setting')) {
        return { subtitle: 'Configure global settings and system parameters', icon: Sliders };
    }

    return { subtitle: 'Configure system resources and parameters', icon: Sliders };
};

export default function AppLayout({
    title,
    children,
}: PropsWithChildren<{ title?: ReactNode }>) {
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    if (!user) return null;

    const titleText = typeof title === 'string' ? title : '';
    const meta = getPageMeta(titleText, location.pathname);
    const PageIcon = meta.icon;
    const subtitleText = meta.subtitle;

    return (
        <div className="relative flex min-h-screen overflow-hidden bg-background text-foreground">
            {/* Ambient Background Blobs from GymOS */}
            <div className="pointer-events-none absolute -left-16 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-rose-300/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

            {/* Floating Desktop Sidebar */}
            <AppSidebar />

            {/* Mobile Sidebar overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black z-40"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-950 z-50 p-4 border-r border-border"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                                <span className="font-heading font-bold text-primary text-lg">Airlink Menu</span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 border-none bg-transparent cursor-pointer"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                            <div className="h-[calc(100vh-120px)] overflow-y-auto pr-1">
                                <AppSidebar />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Application Container */}
            <main className="relative flex-1 lg:ml-[312px] flex flex-col min-h-screen w-full lg:w-auto">
                {/* Mobile Top Navigation Bar */}
                <div className="lg:hidden sticky top-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-border/70 px-4 flex items-center justify-between z-30">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-primary border-none bg-transparent cursor-pointer"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-heading font-bold text-primary text-base">
                        {title}
                    </span>
                    <ThemeToggle className="hover:bg-primary/10 rounded-xl" />
                </div>

                {/* Primary Content Panel */}
                <div className="flex-grow p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 z-10 relative">
                    {/* Centered Page Header Block */}
                    {titleText && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3.5">
                                <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                                    <PageIcon size={32} />
                                </div>
                                <div>
                                    <h2 className="text-[28px] font-heading font-bold tracking-tight text-primary dark:text-white leading-tight">
                                        {titleText}
                                    </h2>
                                    <p className="text-sm text-muted-foreground font-medium mt-0.5">
                                        {subtitleText}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/60 bg-white/70 shadow-sm text-sm font-semibold text-primary dark:bg-slate-900/50 dark:border-slate-800">
                                <CalendarDays size={18} className="text-slate-500" />
                                <span>{formatBilingualDate(new Date())}</span>
                            </div>
                        </div>
                    )}
                    
                    {children}
                </div>

                {/* Footer panel */}
                <div className="border-t border-border/50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md mt-auto">
                    <Footer />
                </div>
            </main>

            <Toaster richColors position="top-right" />
        </div>
    );
}
