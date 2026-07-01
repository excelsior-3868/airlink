import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    CreditCard,
    FileBarChart,
    LayoutDashboard,
    Mail,
    Package,
    Router as RouterIcon,
    Activity,
    Wallet,
    Settings,
    Ticket,
    Wifi,
    Users,
    Globe,
    Receipt,
    Flame,
    Network,
    Sliders,
    Tag,
    Share2,
    Server,
    Database,
    Link as LinkIcon,
    Terminal,
    Clock,
    Lock,
    History,
    AlertTriangle,
    UserCog,
    Download,
    Folder,
    MapPin,
    Dumbbell,
} from 'lucide-react';

interface NavItem {
    label: string;
    path?: string;
    match?: string;
    exact?: boolean;
    icon?: React.ElementType;
}

interface NavGroup {
    label: string;
    icon: React.ElementType;
    color: string;
    path?: string;
    match?: string;
    roles?: string[];
    items?: NavItem[];
}

export const NAV: NavGroup[] = [
    { label: 'Dashboard', icon: LayoutDashboard, color: 'text-sky-500', path: '/dashboard', match: '/dashboard' },
    {
        label: 'Customer',
        icon: CreditCard,
        color: 'text-emerald-500',
        match: '/customers',
        roles: ['admin', 'sales', 'pos'],
        items: [
            { label: 'User Details', path: '/customers', match: '/customers', exact: true, icon: Users },
            { label: 'PPPoE Users', path: '/customers/pppoe', match: '/customers/pppoe', icon: Globe },
            { label: 'Billings', path: '/customers/billing', match: '/customers/billing', icon: Receipt },
        ],
    },
    {
        label: 'Plan',
        icon: Package,
        color: 'text-violet-500',
        match: '/plans',
        roles: ['admin'],
        items: [
            { label: 'Hotspot Plans', path: '/plans', match: '/plans', exact: true, icon: Flame },
            { label: 'PPPoE Plans', path: '/plans/pppoe', match: '/plans/pppoe', icon: Globe },
            { label: 'Bandwidth', path: '/bandwidth', match: '/bandwidth', icon: Network },
        ],
    },
    {
        label: 'Hotspot',
        icon: Wifi,
        color: 'text-orange-500',
        match: '/vouchers',
        roles: ['admin', 'sales', 'pos'],
        items: [
            { label: 'Vouchers', path: '/vouchers', match: '/vouchers', icon: Tag },
            { label: 'Voucher Allocation', path: '/vouchers/allocate', match: '/vouchers/allocate', icon: Share2 },
        ],
    },
    {
        label: 'NAS',
        icon: RouterIcon,
        color: 'text-indigo-500',
        match: '/routers',
        roles: ['admin'],
        items: [
            { label: 'Routers', path: '/routers', match: '/routers', icon: Server },
            { label: 'IP Pools', path: '/pools', match: '/pools', icon: Database },
            { label: 'IP Bind', path: '/ip-bindings', match: '/ip-bindings', icon: LinkIcon },
            { label: 'NAS Logs', path: '/nas/logs', match: '/nas/logs', icon: Terminal },
        ],
    },
    {
        label: 'Monitor NAS',
        icon: Activity,
        color: 'text-rose-500',
        match: '/monitor',
        roles: ['admin'],
        items: [
            { label: 'Active Sessions', path: '/monitor/sessions', match: '/monitor/sessions', icon: Clock },
            { label: 'Auth Logs', path: '/monitor/logs', match: '/monitor/logs', icon: Lock },
        ],
    },
    { label: 'Wallet', icon: Wallet, color: 'text-amber-500', path: '/wallet', match: '/wallet', roles: ['admin', 'sales', 'pos'] },
    {
        label: 'Reports',
        icon: FileBarChart,
        color: 'text-cyan-500',
        match: '/reports',
        roles: ['admin', 'sales'],
        items: [
            { label: 'Recharge History', path: '/reports', match: '/reports', exact: true, icon: History },
            { label: 'Billings Dashboard', path: '/reports/billings', match: '/reports/billings', icon: FileBarChart },
        ],
    },
    { label: 'Messages', icon: Mail, color: 'text-fuchsia-500', path: '/messages', match: '/messages' },
    {
        label: 'Tickets',
        icon: Ticket,
        color: 'text-red-500',
        match: '/tickets',
        roles: ['admin', 'sales'],
        items: [
            { label: 'Complaints', path: '/tickets', match: '/tickets', exact: true, icon: AlertTriangle },
        ],
    },
    {
        label: 'Administration',
        icon: Settings,
        color: 'text-slate-500',
        match: '/administration',
        roles: ['admin'],
        items: [
            { label: 'System Users', path: '/administration/users', match: '/administration/users', icon: UserCog },
            { label: 'General Settings', path: '/administration/settings', match: '/administration/settings', icon: Sliders },
            { label: 'Backup / Restore', path: '/administration/backup', match: '/administration/backup', icon: Download },
            { label: 'CMS Categories', path: '/administration/cms/categories', match: '/administration/cms/categories', icon: Folder },
            { label: 'CMS States', path: '/administration/cms/states', match: '/administration/cms/states', icon: MapPin },
        ],
    },
];

export const getColorClasses = (colorName: string) => {
    const colorMap: Record<string, { icon: string; bg: string; border: string }> = {
        sky: { icon: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-500/10 dark:bg-sky-500/20', border: 'border-sky-500/20 dark:border-sky-400/30' },
        emerald: { icon: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', border: 'border-emerald-500/20 dark:border-emerald-400/30' },
        violet: { icon: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-500/10 dark:bg-violet-500/20', border: 'border-violet-500/20 dark:border-violet-400/30' },
        orange: { icon: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500/10 dark:bg-orange-500/20', border: 'border-orange-500/20 dark:border-orange-400/30' },
        indigo: { icon: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', border: 'border-indigo-500/20 dark:border-indigo-400/30' },
        rose: { icon: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500/10 dark:bg-rose-500/20', border: 'border-rose-500/20 dark:border-rose-400/30' },
        amber: { icon: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-500/20', border: 'border-amber-500/20 dark:border-amber-400/30' },
        cyan: { icon: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', border: 'border-cyan-500/20 dark:border-cyan-400/30' },
    };
    return colorMap[colorName] || { icon: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
};

const SidebarItem = ({
    item,
    active,
    isOpen,
    onToggle,
    isCurrent
}: {
    item: NavGroup,
    active: boolean,
    isOpen: boolean,
    onToggle: () => void,
    isCurrent: (pattern?: string, exact?: boolean) => boolean
}) => {
    const hasChildren = !!item.items;

    return (
        <div className="flex flex-col">
            {hasChildren ? (
                <button
                    onClick={onToggle}
                    className={`flex items-center gap-3 rounded-[18px] px-3.5 py-3 text-[15px] font-semibold transition-all group outline-none border-none bg-transparent cursor-pointer ${
                        active
                            ? 'app-sidebar-nav-item-active'
                            : 'app-sidebar-nav-item-idle'
                    }`}
                >
                    <item.icon
                        size={18}
                        className={`shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-current' : item.color}`}
                    />
                    <span className="font-semibold text-[15px] flex-1 text-left">{item.label}</span>
                    <ChevronRight size={14} className={`ml-auto opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                </button>
            ) : (
                <Link to={item.path || '#'} className="no-underline">
                    <motion.div
                        className={`flex items-center gap-3 rounded-[18px] px-3.5 py-3 text-[15px] font-semibold transition-all group ${
                            active
                                ? 'app-sidebar-nav-item-active'
                                : 'app-sidebar-nav-item-idle'
                        }`}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <item.icon
                            size={18}
                            className={`shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-current' : item.color}`}
                        />
                        <span className="font-semibold text-[15px]">{item.label}</span>
                        {active && <ChevronRight size={12} className="ml-auto opacity-50 text-current/70" />}
                    </motion.div>
                </Link>
            )}

            <AnimatePresence initial={false}>
                {hasChildren && isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden flex flex-col gap-1 ml-5 mt-2 border-l border-slate-200/80 dark:border-slate-800 pl-4"
                    >
                        {item.items?.map((child) => {
                            const isChildActive = isCurrent(child.match, child.exact);
                            const ChildIcon = child.icon || ChevronRight;
                            return (
                                <Link key={child.path} to={child.path || '#'} className="no-underline">
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all text-[14px] font-medium ${isChildActive ? 'bg-primary/5 text-primary shadow-sm font-semibold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800/40 dark:hover:text-slate-200'}`}>
                                        <ChildIcon size={14} className="shrink-0" />
                                        <span>{child.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export function AppSidebar() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        try {
            const saved = localStorage.getItem('sidebar_open_groups');
            if (saved) return JSON.parse(saved);
        } catch (e) {}

        const initialGroups: Record<string, boolean> = {};
        const pathname = window.location.pathname;
        NAV.forEach((group) => {
            if (group.items) {
                const hasMatchingChild = group.items.some(child => 
                    child.path && pathname.startsWith(child.path)
                );
                const matchesGroup = group.match && pathname.startsWith(group.match);

                if (hasMatchingChild || matchesGroup) {
                    initialGroups[group.label] = true;
                }
            }
        });
        return initialGroups;
    });

    const toggleGroup = (label: string) => {
        setOpenGroups(prev => {
            const next = { ...prev, [label]: !prev[label] };
            try {
                localStorage.setItem('sidebar_open_groups', JSON.stringify(next));
            } catch (e) {}
            return next;
        });
    };
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedScroll = sessionStorage.getItem('sidebar_scroll_top');
        if (savedScroll && navRef.current) {
            navRef.current.scrollTop = Number(savedScroll);
        }
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        sessionStorage.setItem('sidebar_scroll_top', String(e.currentTarget.scrollTop));
    };

    const isCurrent = (pattern?: string, exact?: boolean) => {
        if (!pattern) return false;
        if (exact) {
            return location.pathname === pattern;
        }
        return location.pathname.startsWith(pattern);
    };



    const filteredNav = NAV.filter(
        (group) => !group.roles || (user && group.roles.includes(user.role))
    );

    return (
        <aside className="app-sidebar-shell hidden lg:flex fixed left-3 top-2 h-[calc(100vh-1rem)] w-[300px] flex-col z-50">
            <div className="app-sidebar-panel flex h-full flex-col px-5 py-6">
                <div className="flex pb-5 px-2">
                    <Link to="/dashboard" className="flex items-center gap-4 group cursor-pointer hover:no-underline no-underline">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl font-heading font-bold text-primary transition-transform group-hover:scale-105">
                            <Dumbbell className="size-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-[18px] font-heading font-bold tracking-tight text-[#9f230f] transition-colors group-hover:text-[#8a1f0d]">
                                Airlink
                            </div>
                            <p className="text-[12px] font-medium text-slate-500 -mt-0.5">ISP Billing</p>
                        </div>
                    </Link>
                </div>

                <nav
                    ref={navRef}
                    onScroll={handleScroll}
                    className="flex flex-1 flex-col gap-2.5 overflow-y-auto no-scrollbar pr-1"
                >
                    {filteredNav.map((group) => {
                        const hasChildren = !!group.items;
                        const isActive = isCurrent(group.match, !hasChildren);
                        return (
                            <SidebarItem
                                key={group.label}
                                item={group}
                                active={!!isActive}
                                isOpen={!!openGroups[group.label]}
                                onToggle={() => toggleGroup(group.label)}
                                isCurrent={isCurrent}
                            />
                        );
                    })}
                </nav>

                <div className="relative mt-auto border-t border-slate-200/80 dark:border-slate-800 pt-6">
                    <AnimatePresence>
                        {profileDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-full left-0 z-[60] mb-4 w-full overflow-hidden rounded-[28px] border border-white/80 bg-white/96 p-2 shadow-2xl backdrop-blur-xl dark:bg-slate-900 dark:border-slate-800"
                            >
                                <button
                                    onClick={logout}
                                    className="group flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-destructive transition-all hover:bg-destructive/5 border-none bg-transparent cursor-pointer"
                                >
                                    <div className="rounded-2xl bg-destructive/10 p-2 text-destructive transition-all group-hover:bg-destructive group-hover:text-white">
                                        <Lock size={18} />
                                    </div>
                                    <span className="text-sm font-bold">Log Out</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        className={`app-sidebar-profile cursor-pointer p-4 transition-all rounded-[24px] border border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/40 ${
                            profileDropdownOpen ? 'bg-slate-100 dark:bg-slate-800' : ''
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-14 w-14 overflow-hidden rounded-[20px] border border-white/80 bg-primary/10 text-xl font-bold text-primary flex items-center justify-center dark:border-slate-700">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-1 flex-col min-w-0">
                                <span className="text-[15px] font-bold text-[#9f230f] leading-tight truncate">{user?.name}</span>
                                <span className="text-[11px] font-semibold text-slate-400 capitalize truncate">
                                    {user?.role}
                                </span>
                            </div>
                            <div className={`text-slate-400 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`}>
                                <ChevronRight size={16} className="-rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
