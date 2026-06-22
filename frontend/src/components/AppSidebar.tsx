import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    SidebarFooter,
    useSidebar,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ApplicationLogo from '@/components/ApplicationLogo';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
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
    ChevronDown,
    LogOut,
    Menu,
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
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/Layouts/AppLayout';

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
    { label: 'Dashboard', icon: LayoutDashboard, color: 'sky', path: '/dashboard', match: '/dashboard' },
    {
        label: 'Customer',
        icon: CreditCard,
        color: 'emerald',
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
        color: 'violet',
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
        color: 'orange',
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
        color: 'indigo',
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
        color: 'rose',
        match: '/monitor',
        roles: ['admin'],
        items: [
            { label: 'Active Sessions', path: '/monitor/sessions', match: '/monitor/sessions', icon: Clock },
            { label: 'Auth Logs', path: '/monitor/logs', match: '/monitor/logs', icon: Lock },
        ],
    },
    { label: 'Wallet', icon: Wallet, color: 'amber', path: '/wallet', match: '/wallet', roles: ['admin', 'sales', 'pos'] },
    {
        label: 'Reports',
        icon: FileBarChart,
        color: 'cyan',
        match: '/reports',
        roles: ['admin', 'sales'],
        items: [
            { label: 'Recharge History', path: '/reports', match: '/reports', exact: true, icon: History },
            { label: 'Billings Dashboard', path: '/reports/billings', match: '/reports/billings', icon: FileBarChart },
        ],
    },
    { label: 'Messages', icon: Mail, color: 'fuchsia', path: '/messages', match: '/messages' },
    {
        label: 'Tickets',
        icon: Ticket,
        color: 'red',
        match: '/tickets',
        roles: ['admin', 'sales'],
        items: [
            { label: 'Complaints', path: '/tickets', match: '/tickets', exact: true, icon: AlertTriangle },
        ],
    },
    {
        label: 'Administration',
        icon: Settings,
        color: 'slate',
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
        fuchsia: { icon: 'text-fuchsia-500 dark:text-fuchsia-400', bg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/20', border: 'border-fuchsia-500/20 dark:border-fuchsia-400/30' },
        red: { icon: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/10 dark:bg-red-500/20', border: 'border-red-500/20 dark:border-red-400/30' },
        slate: { icon: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-500/10 dark:bg-slate-500/20', border: 'border-slate-500/20 dark:border-slate-400/30' },
    };
    
    return colorMap[colorName] || { icon: 'text-sidebar-foreground', bg: 'bg-transparent', border: 'border-transparent' };
};

export function CollapsibleAppSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { state, toggleSidebar } = useSidebar();
    const isCollapsed = state === 'collapsed';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isCurrent = (pattern?: string, exact?: boolean) => {
        if (!pattern) return false;
        if (exact) {
            return location.pathname === pattern;
        }
        return location.pathname.startsWith(pattern);
    };

    return (
        <Sidebar
            collapsible="icon"
            variant="floating"
            className={cn(
                "bg-transparent border-none text-sidebar-foreground z-30 transition-all duration-300",
                "group-data-[state=expanded]:md:p-4 group-data-[state=collapsed]:md:p-2",
                "[&>div[data-sidebar=sidebar]]:bg-white [&>div[data-sidebar=sidebar]]:dark:bg-card [&>div[data-sidebar=sidebar]]:rounded-[24px] [&>div[data-sidebar=sidebar]]:shadow-md [&>div[data-sidebar=sidebar]]:border [&>div[data-sidebar=sidebar]]:border-slate-200/60 [&>div[data-sidebar=sidebar]]:dark:border-slate-800/60"
            )}
        >
            <SidebarHeader className={cn("border-b border-sidebar-border/50 pb-4 pt-4", isCollapsed ? "px-1" : "px-4")}>
                {isCollapsed ? (
                    <div className="flex flex-col items-center gap-4 py-1.5">
                        <button
                            onClick={toggleSidebar}
                            className="text-sidebar-foreground hover:bg-primary/10 p-2 rounded-xl active:scale-95 transition-all cursor-pointer"
                            title="Expand Sidebar"
                        >
                            <Menu className="h-5 w-5 rotate-0 transition-transform duration-300 ease-in-out" />
                        </button>
                        <ThemeToggle className="text-sidebar-foreground hover:bg-primary/10" />
                    </div>
                ) : (
                    <div className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center shrink-0 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1">
                                <ApplicationLogo className="size-full object-contain dark:invert" />
                            </div>
                            <div className="grid text-left text-sm leading-tight">
                                <span className="truncate font-bold text-primary">Nepal Airlink</span>
                                <span className="truncate text-[10px] text-muted-foreground font-semibold">
                                    Nepal Airlink
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <ThemeToggle className="text-sidebar-foreground hover:bg-primary/10" />
                            <button
                                onClick={toggleSidebar}
                                className="text-sidebar-foreground hover:bg-primary/10 p-2 rounded-xl active:scale-95 transition-all cursor-pointer"
                                title="Collapse Sidebar"
                            >
                                <Menu className="h-5 w-5 rotate-180 transition-transform duration-300 ease-in-out" />
                            </button>
                        </div>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent className="px-2 py-3">
                <ScrollArea className="flex-1">
                    <SidebarGroup className="p-0">
                        <SidebarMenu className="gap-1.5">
                            {NAV.filter(group => !group.roles || (user && group.roles.includes(user.role))).map((group) =>
                                group.items ? (
                                    <Collapsible
                                        key={group.label}
                                        defaultOpen={isCurrent(group.match)}
                                        className="group/collapsible"
                                        asChild
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={group.label}
                                                    className={cn(
                                                        "h-auto rounded-xl transition-all duration-200 group relative overflow-hidden cursor-pointer",
                                                        isCollapsed ? "py-2.5 px-0 w-full flex justify-center" : "py-2.5 px-3.5",
                                                        isCurrent(group.match)
                                                            ? "bg-primary/10 text-primary hover:text-primary font-bold"
                                                            : "text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary font-medium"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "relative flex items-center justify-center transition-all duration-200 shrink-0",
                                                        isCollapsed ? "w-9 h-9" : "w-5 h-5",
                                                        "group-hover:scale-110"
                                                    )}>
                                                        <group.icon className={cn(
                                                            "flex-shrink-0 transition-transform duration-200 h-5 w-5",
                                                            getColorClasses(group.color).icon
                                                        )} />
                                                    </div>
                                                    {!isCollapsed && (
                                                        <span className="whitespace-nowrap truncate text-sm relative z-10 ml-2.5 flex-1 text-left">
                                                            {group.label}
                                                        </span>
                                                    )}
                                                    {!isCollapsed && (
                                                        <ChevronRight className={cn(
                                                            "ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90",
                                                            isCurrent(group.match) ? "text-primary font-bold" : "text-slate-400"
                                                        )} />
                                                    )}
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub className="ml-5 border-l border-slate-200 dark:border-slate-800 pl-2.5 mt-1 gap-1">
                                                    {group.items.map((item) => (
                                                        <SidebarMenuSubItem key={item.label}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={isCurrent(item.match, item.exact)}
                                                                className={cn(
                                                                    "flex h-9 min-w-0 items-center gap-2 rounded-lg px-2.5 text-sm transition-all group/sub-btn",
                                                                    isCurrent(item.match, item.exact)
                                                                        ? "bg-primary/10 text-primary font-bold"
                                                                        : "text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary"
                                                                )}
                                                            >
                                                                <Link to={item.path || '#'} className="flex items-center gap-2.5 w-full">
                                                                    {item.icon && (
                                                                        <item.icon className={cn(
                                                                            "h-4 w-4 shrink-0 transition-all duration-200 group-hover/sub-btn:scale-110",
                                                                            isCurrent(item.match, item.exact)
                                                                                ? "text-primary"
                                                                                : cn("opacity-70 group-hover/sub-btn:opacity-100", getColorClasses(group.color).icon)
                                                                        )} />
                                                                    )}
                                                                    <span>{item.label}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                ) : (
                                    <SidebarMenuItem key={group.label}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={group.label}
                                            className={cn(
                                                "h-auto rounded-xl transition-all duration-200 group relative overflow-hidden cursor-pointer",
                                                isCollapsed ? "py-2.5 px-0 w-full flex justify-center" : "py-2.5 px-3.5",
                                                isCurrent(group.match)
                                                    ? "bg-primary/10 text-primary hover:text-primary font-bold"
                                                    : "text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary font-medium"
                                            )}
                                        >
                                            <Link to={group.path || '#'}>
                                                <div className={cn(
                                                    "relative flex items-center justify-center transition-all duration-200 shrink-0",
                                                    isCollapsed ? "w-9 h-9" : "w-5 h-5",
                                                    "group-hover:scale-110"
                                                )}>
                                                    <group.icon className={cn(
                                                        "flex-shrink-0 transition-transform duration-200 h-5 w-5",
                                                        getColorClasses(group.color).icon
                                                    )} />
                                                </div>
                                                {!isCollapsed && (
                                                    <span className="whitespace-nowrap truncate text-sm relative z-10 ml-2.5 flex-1 text-left">
                                                        {group.label}
                                                    </span>
                                                )}
                                                {!isCollapsed && isCurrent(group.match) && (
                                                    <ChevronRight className="ml-auto size-4 text-primary shrink-0 font-bold" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            )}
                        </SidebarMenu>
                    </SidebarGroup>
                </ScrollArea>
            </SidebarContent>

            <SidebarFooter className={cn("py-4 bg-sidebar border-t border-sidebar-border/50", isCollapsed ? "px-1" : "px-3")}>
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "flex w-full items-center gap-2.5 outline-none cursor-pointer text-left transition-all active:scale-[0.98]",
                                isCollapsed 
                                    ? "justify-center hover:bg-primary/10 p-2 rounded-xl" 
                                    : "bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-900"
                            )}>
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                {!isCollapsed && (
                                    <div className="grid flex-1 text-left text-xs leading-tight">
                                        <span className="truncate font-bold text-slate-800 dark:text-slate-100">{user.name}</span>
                                        <span className="truncate text-[10px] text-muted-foreground font-semibold capitalize mt-0.5">{user.role}</span>
                                    </div>
                                )}
                                {!isCollapsed && <ChevronDown className="size-3.5 text-muted-foreground shrink-0 ml-1" />}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="right" className="w-48">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{user.name}</span>
                                    <span className="text-xs capitalize text-muted-foreground">{user.role}</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                                <LogOut className="mr-2 size-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
