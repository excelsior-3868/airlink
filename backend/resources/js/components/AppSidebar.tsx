import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import {
    ChevronRight,
    CreditCard,
    FileBarChart,
    LayoutDashboard,
    Mail,
    Package,
    Router as RouterIcon,
    Settings,
    Activity,
    Wallet,
    Wifi,
} from 'lucide-react';

/** Resolve a route name to a URL, or '#' if it isn't registered yet. */
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
    routeName?: string; // target route name
    match?: string; // route().current() pattern for active state
}

interface NavGroup {
    label: string;
    icon: React.ElementType;
    routeName?: string; // if set, group is a direct link (no sub-items)
    match?: string;
    items?: NavItem[];
}

// Mirrors the legacy PHPMixBill sidebar. Items whose routes are not built yet
// resolve to '#' and are filled in as each phase lands.
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
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-1.5">
                    <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Wifi className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">Airlink</span>
                        <span className="truncate text-xs text-muted-foreground">
                            ISP Billing
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
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
                                            >
                                                <group.icon />
                                                <span>{group.label}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {group.items.map((item) => (
                                                    <SidebarMenuSubItem
                                                        key={item.label}
                                                    >
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isCurrent(
                                                                item.match,
                                                            )}
                                                        >
                                                            <Link
                                                                href={url(
                                                                    item.routeName,
                                                                )}
                                                            >
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
                                    >
                                        <Link href={url(group.routeName)}>
                                            <group.icon />
                                            <span>{group.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ),
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
