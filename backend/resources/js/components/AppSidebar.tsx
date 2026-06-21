import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    CreditCard,
    FileBarChart,
    LayoutDashboard,
    LogOut,
    Mail,
    Package,
    Router as RouterIcon,
    Settings,
    Activity,
    User,
    Wallet,
    Wifi,
} from 'lucide-react';

interface SharedProps {
    auth: { user: { name: string; username: string; role: string } };
}

function url(name?: string): string {
    if (!name) return '#';
    try {
        return route().has(name) ? route(name) : '#';
    } catch {
        return '#';
    }
}

function isCurrent(pattern?: string): boolean {
    if (!pattern) return false;
    try {
        return route().current(pattern);
    } catch {
        return false;
    }
}

interface NavItem {
    label: string;
    routeName?: string;
    match?: string;
}

interface NavGroup {
    label: string;
    icon: React.ElementType;
    routeName?: string;
    match?: string;
    items?: NavItem[];
}

const NAV: NavGroup[] = [
    { label: 'Home', icon: LayoutDashboard, routeName: 'dashboard', match: 'dashboard' },
    {
        label: 'Customer',
        icon: CreditCard,
        match: 'customers.*',
        items: [
            { label: 'User Details', routeName: 'customers.index', match: 'customers.*' },
            { label: 'Search Details' },
            { label: 'PPPOE Users' },
            { label: 'Billings' },
        ],
    },
    {
        label: 'Plan',
        icon: Package,
        match: 'plans.*',
        items: [
            { label: 'Plans', routeName: 'plans.index', match: 'plans.*' },
            { label: 'Bandwidth', routeName: 'bandwidth.index', match: 'bandwidth.*' },
        ],
    },
    {
        label: 'Hotspot',
        icon: Wifi,
        match: 'vouchers.*',
        items: [
            { label: 'Vouchers', routeName: 'vouchers.index', match: 'vouchers.*' },
        ],
    },
    {
        label: 'NAS',
        icon: RouterIcon,
        match: 'routers.*',
        items: [
            { label: 'Routers', routeName: 'routers.index', match: 'routers.*' },
            { label: 'IP Pools', routeName: 'pools.index', match: 'pools.*' },
        ],
    },
    {
        label: 'Monitor NAS',
        icon: Activity,
        match: 'monitor.*',
        items: [
            { label: 'Active Sessions', routeName: 'monitor.sessions', match: 'monitor.sessions' },
            { label: 'Auth Logs', routeName: 'monitor.logs', match: 'monitor.logs' },
        ],
    },
    { label: 'Wallet', icon: Wallet, routeName: 'wallet.index', match: 'wallet.*' },
    { label: 'Reports', icon: FileBarChart, routeName: 'reports.index', match: 'reports.*' },
    { label: 'Messages', icon: Mail, routeName: 'messages.index', match: 'messages.*' },
    {
        label: 'Administration',
        icon: Settings,
        items: [{ label: 'Users' }, { label: 'Settings' }, { label: 'Localization' }],
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as unknown as SharedProps;
    const initials = auth?.user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? '?';

    return (
        <Sidebar collapsible="icon">
            {/* ── Logo / Brand ──────────────────────────────── */}
            <SidebarHeader className="border-b border-sidebar-border pb-3">
                <div className="flex items-center gap-2.5 px-2 py-1">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-md">
                        <Wifi className="size-4 text-primary-foreground" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-bold text-foreground">Airlink</span>
                        <span className="truncate text-[11px] text-muted-foreground">ISP Billing</span>
                    </div>
                </div>
            </SidebarHeader>

            {/* ── Navigation ───────────────────────────────── */}
            <SidebarContent className="py-2">
                <SidebarGroup>
                    <SidebarMenu>
                        {NAV.map((group) =>
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
                                                isActive={isCurrent(group.match)}
                                                className="h-9 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                                            >
                                                <group.icon className="size-4 shrink-0" />
                                                <span className="text-sm">{group.label}</span>
                                                <ChevronRight className="ml-auto size-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {group.items.map((item) => (
                                                    <SidebarMenuSubItem key={item.label}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isCurrent(item.match)}
                                                            className="h-8 rounded-md text-[13px] transition-all duration-150 hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                                                        >
                                                            <Link href={url(item.routeName)}>
                                                                {item.label}
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
                                        isActive={isCurrent(group.match)}
                                        className="h-9 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                                    >
                                        <Link href={url(group.routeName)}>
                                            <group.icon className="size-4 shrink-0" />
                                            <span className="text-sm">{group.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ),
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* ── User footer ──────────────────────────────── */}
            <SidebarFooter className="border-t border-sidebar-border py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip={auth?.user?.name ?? 'Profile'}
                            className="h-10 rounded-lg hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                        >
                            <Link href={route('profile.edit')}>
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                                    {initials}
                                </div>
                                <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-semibold text-sm">{auth?.user?.name}</span>
                                    <span className="truncate text-[11px] text-muted-foreground capitalize">{auth?.user?.role}</span>
                                </div>
                                <User className="ml-auto size-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Sign Out"
                            className="h-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-200 cursor-pointer"
                        >
                            <Link href={route('logout')} method="post" as="button" className="w-full">
                                <LogOut className="size-4 shrink-0" />
                                <span className="text-sm group-data-[collapsible=icon]:hidden">Sign Out</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
