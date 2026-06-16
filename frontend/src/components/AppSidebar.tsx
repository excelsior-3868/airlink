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
} from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
    Wifi,
} from 'lucide-react';

interface NavItem {
    label: string;
    path?: string; // target path
    match?: string; // pathname check
}

interface NavGroup {
    label: string;
    icon: React.ElementType;
    path?: string; // if set, group is a direct link (no sub-items)
    match?: string;
    roles?: string[]; // visible roles
    items?: NavItem[];
}

const NAV: NavGroup[] = [
    { label: 'Home', icon: LayoutDashboard, path: '/dashboard', match: '/dashboard' },
    {
        label: 'Customer',
        icon: CreditCard,
        match: '/customers',
        roles: ['admin', 'sales'],
        items: [
            { label: 'User Details', path: '/customers', match: '/customers' },
        ],
    },
    {
        label: 'Plan',
        icon: Package,
        match: '/plans',
        roles: ['admin'],
        items: [
            { label: 'Plans', path: '/plans', match: '/plans' },
            { label: 'Bandwidth', path: '/bandwidth', match: '/bandwidth' },
        ],
    },
    {
        label: 'Hotspot',
        icon: Wifi,
        match: '/vouchers',
        roles: ['admin', 'sales'],
        items: [
            { label: 'Vouchers', path: '/vouchers', match: '/vouchers' },
        ],
    },
    {
        label: 'NAS',
        icon: RouterIcon,
        match: '/routers',
        roles: ['admin'],
        items: [
            { label: 'Routers', path: '/routers', match: '/routers' },
            { label: 'IP Pools', path: '/pools', match: '/pools' },
        ],
    },
    {
        label: 'Monitor NAS',
        icon: Activity,
        match: '/monitor',
        roles: ['admin'],
        items: [
            { label: 'Active Sessions', path: '/monitor/sessions', match: '/monitor/sessions' },
            { label: 'Auth Logs', path: '/monitor/logs', match: '/monitor/logs' },
        ],
    },
    { label: 'Wallet', icon: Wallet, path: '/wallet', match: '/wallet', roles: ['admin'] },
    { label: 'Reports', icon: FileBarChart, path: '/reports', match: '/reports', roles: ['admin', 'sales'] },
    { label: 'Messages', icon: Mail, path: '/messages', match: '/messages' },
];

export function AppSidebar() {
    const location = useLocation();
    const { user } = useAuth();

    const isCurrent = (pattern?: string) => {
        if (!pattern) return false;
        return location.pathname.startsWith(pattern);
    };

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
                                                                to={item.path || '#'}
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
                                        <Link to={group.path || '#'}>
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
