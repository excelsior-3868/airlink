import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/Layouts/AppLayout';
import api from '@/lib/api';
import { Link } from 'react-router-dom';
import {
    Ticket,
    Users,
    Wifi,
    CreditCard,
    ArrowRight,
    LockOpen,
    Lock,
    Trash2,
    Eye,
    EyeOff,
    UserCheck,
    Clock,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stats {
    totalVouchers: number;
    activeHotspot: number;
    usedExpiredVouchers: number;
    damagedReturnedVouchers: number;
    totalPppoeUsers: number;
    activePppoe: number;
    expiredUsers: number;
    disabledUsers: number;
}

interface POSStats {
    vouchersCount: number;
    usedVouchers: number;
    userNoPpp: number;
    activeHotspot: number;
    activePpp: number;
}

interface POSUser {
    generated_for: string;
    total_generated_for: number;
    matching_codes: number;
    expired_codes: number;
}

interface Allocation {
    allocation: string;
    count: number;
    first_id: number;
    last_id: number;
    matching_users: number;
}

interface ActivityLog {
    id: number;
    date: string;
    description: string;
    username: string | null;
}

const fmt = new Intl.NumberFormat();

export default function Dashboard() {
    const [role, setRole] = useState<'staff' | 'pos'>('staff');
    const [sadmin, setSadmin] = useState('');
    const [stats, setStats] = useState<Stats | null>(null);
    const [posStats, setPosStats] = useState<POSStats | null>(null);
    const [posUsers, setPosUsers] = useState<POSUser[]>([]);
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/dashboard')
            .then((res) => {
                setRole(res.data.role);
                if (res.data.role === 'pos') {
                    setPosStats(res.data.stats);
                    setSadmin(res.data.sadmin);
                    // Fetch allocations
                    api.get('/vouchers/allocations')
                        .then((allocRes) => {
                            setAllocations(allocRes.data || []);
                            setLoading(false);
                        })
                        .catch(() => {
                            setLoading(false);
                        });
                } else {
                    setStats(res.data.stats);
                    setPosUsers(res.data.posUsers || []);
                    setAllocations(res.data.allocatedVouchers || []);
                    setActivityLogs(res.data.activityLogs || []);
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to load dashboard.');
                setLoading(false);
            });
    }, []);

    const formatRelativeTime = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    if (loading) {
        return (
            <AppLayout title="Dashboard">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout title="Dashboard">
                <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
                    {error}
                </div>
            </AppLayout>
        );
    }

    // Render POS Dashboard View
    if (role === 'pos' && posStats) {
        return (
            <AppLayout title="POS Seller Portal">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="bg-slate-50 border rounded-xl p-5 shadow-xs">
                        <h2 className="text-xl font-bold text-slate-800">Welcome, {sadmin}</h2>
                        <p className="text-xs text-slate-500">Access your voucher batches and allocate tickets below.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="glass-card border border-slate-200/60 dark:border-slate-800/60 hover:scale-[1.01] transition-all duration-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100/80 dark:border-slate-800/50">
                                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Total Vouchers</CardTitle>
                               <Ticket className="size-4 text-indigo-600 dark:text-indigo-400" />
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{fmt.format(posStats.vouchersCount)}</div>
                                <p className="text-xs text-muted-foreground">assigned to you</p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border border-slate-200/60 dark:border-slate-800/60 hover:scale-[1.01] transition-all duration-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100/80 dark:border-slate-800/50">
                                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Used Vouchers</CardTitle>
                                <Wifi className="size-4 text-emerald-600 dark:text-emerald-400" />
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{fmt.format(posStats.usedVouchers)}</div>
                                <p className="text-xs text-muted-foreground">recharged successfully</p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border border-slate-200/60 dark:border-slate-800/60 hover:scale-[1.01] transition-all duration-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100/80 dark:border-slate-800/50">
                                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Unused Vouchers</CardTitle>
                                <CreditCard className="size-4 text-sky-600 dark:text-sky-400" />
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                                    {fmt.format(posStats.vouchersCount - posStats.usedVouchers)}
                                </div>
                                <p className="text-xs text-muted-foreground">available to sell</p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border border-slate-200/60 dark:border-slate-800/60 hover:scale-[1.01] transition-all duration-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100/80 dark:border-slate-800/50">
                                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">PPPoE Accounts</CardTitle>
                                <Users className="size-4 text-amber-600 dark:text-amber-400" />
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{fmt.format(posStats.userNoPpp)}</div>
                                <p className="text-xs text-muted-foreground">total active recharges</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Voucher Allocations Summary */}
                    <Card className="glass-card border border-slate-200/60 dark:border-slate-800/60">
                        <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/80">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-800">Allocated Voucher Batches</CardTitle>
                            </div>
                            <Link
                                to="/vouchers/allocate"
                                className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
                            >
                                Allocate Voucher <ArrowRight className="size-3" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-4">
                            {allocations.length === 0 ? (
                                <div className="text-center text-slate-500 py-6 text-sm">
                                    No allocated voucher batches found.
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50">
                                                    <TableHead className="font-bold text-slate-700">Voucher Collector</TableHead>
                                                    <TableHead className="font-bold text-slate-700">Total Count</TableHead>
                                                    <TableHead className="font-bold text-slate-700">Used Vouchers</TableHead>
                                                    <TableHead className="font-bold text-slate-700">Unused Vouchers</TableHead>
                                                    <TableHead className="font-bold text-slate-700">ID Range</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {allocations.map((a, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="font-semibold text-slate-700">{a.allocation}</TableCell>
                                                        <TableCell>{a.count}</TableCell>
                                                        <TableCell className="text-emerald-600 font-semibold">{a.matching_users}</TableCell>
                                                        <TableCell className="text-slate-600 font-semibold">{a.count - a.matching_users}</TableCell>
                                                        <TableCell className="font-mono text-xs text-slate-500">
                                                            ID {a.first_id} - ID {a.last_id}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {allocations.map((a, i) => (
                                            <div key={i} className="bg-white dark:bg-card border rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between gap-3 hover:shadow-sm transition-all">
                                                <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                                                    <span className="font-bold text-slate-800 dark:text-slate-100">{a.allocation}</span>
                                                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 border rounded-full text-xs font-semibold px-2 py-0.5">
                                                        {a.count} Total
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                                    <div className="p-2 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                        <div className="font-bold">{a.matching_users}</div>
                                                        <div className="text-[10px] text-muted-foreground font-medium">Used</div>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                        <div className="font-bold">{a.count - a.matching_users}</div>
                                                        <div className="text-[10px] text-muted-foreground font-medium">Unused</div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-muted-foreground border-t pt-2 border-slate-100 dark:border-slate-800 font-mono text-center">
                                                    ID Range: ID {a.first_id} - ID {a.last_id}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    // Render Standard Admin/Sales Dashboard View
    return (
        <AppLayout title="Dashboard">
            <div className="mx-auto max-w-7xl space-y-6">
                
                {/* Hotspot Row */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 pl-1">Hotspot Overview</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Link
                            to="/vouchers"
                            className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-5 flex items-center justify-between h-28 hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all duration-200 group cursor-pointer"
                        >
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-muted-foreground">Total Voucher</div>
                                <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">{stats ? fmt.format(stats.totalVouchers) : 0}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 dark:text-sky-400 group-hover:scale-110 transition-transform duration-200">
                                <CreditCard className="size-6" />
                            </div>
                        </Link>

                        <Link
                            to="/vouchers"
                            className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-5 flex items-center justify-between h-28 hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all duration-200 group cursor-pointer"
                        >
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-muted-foreground">Active Hotspot</div>
                                <div className="text-2xl font-extrabold text-orange-500 dark:text-orange-400">{stats ? fmt.format(stats.activeHotspot) : 0}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform duration-200">
                                <LockOpen className="size-6" />
                            </div>
                        </Link>

                        <Link
                            to="/vouchers"
                            className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-5 flex items-center justify-between h-28 hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all duration-200 group cursor-pointer"
                        >
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-muted-foreground">Used/Expired Voucher</div>
                                <div className="text-2xl font-extrabold text-rose-500 dark:text-rose-400">{stats ? fmt.format(stats.usedExpiredVouchers) : 0}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform duration-200">
                                <Lock className="size-6" />
                            </div>
                        </Link>

                        <Link
                            to="/vouchers"
                            className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-5 flex items-center justify-between h-28 hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all duration-200 group cursor-pointer"
                        >
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-muted-foreground">Damaged/Returned Voucher</div>
                                <div className="text-2xl font-extrabold text-teal-500 dark:text-teal-400">{stats ? fmt.format(stats.damagedReturnedVouchers) : 0}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-500 dark:text-teal-400 group-hover:scale-110 transition-transform duration-200">
                                <CreditCard className="size-6" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* PPPoE Row */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 pl-1">PPPoE Overview</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Link
                            to="/customers/pppoe"
                            className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-5 flex items-center justify-between h-28 hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all duration-200 group cursor-pointer"
                        >
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-muted-foreground">Total PPPoE Users</div>
                                <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">{stats ? fmt.format(stats.totalPppoeUsers) : 0}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 dark:text-sky-400 group-hover:scale-110 transition-transform duration-200">
                                <Users className="size-6" />
                            </div>
                        </Link>

                        <Link
                            to="/customers/pppoe"
                            className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-5 flex items-center justify-between h-28 hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all duration-200 group cursor-pointer"
                        >
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-muted-foreground">Active PPPoE</div>
                                <div className="text-2xl font-extrabold text-orange-500 dark:text-orange-400">{stats ? fmt.format(stats.activePppoe) : 0}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform duration-200">
                                <Eye className="size-6" />
                            </div>
                        </Link>

                        <Link
                            to="/customers/pppoe?expiry_range=expired"
                            className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-5 flex items-center justify-between h-28 hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all duration-200 group cursor-pointer"
                        >
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-muted-foreground">Expired User</div>
                                <div className="text-2xl font-extrabold text-rose-500 dark:text-rose-400">{stats ? fmt.format(stats.expiredUsers) : 0}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform duration-200">
                                <Trash2 className="size-6" />
                            </div>
                        </Link>

                        <Link
                            to="/customers?status=disable"
                            className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-5 flex items-center justify-between h-28 hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all duration-200 group cursor-pointer"
                        >
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-muted-foreground">Disabled User</div>
                                <div className="text-2xl font-extrabold text-teal-500 dark:text-teal-400">{stats ? fmt.format(stats.disabledUsers) : 0}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-500 dark:text-teal-400 group-hover:scale-110 transition-transform duration-200">
                                <EyeOff className="size-6" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Tables Grid */}
                <div className="grid gap-6 lg:grid-cols-12">
                    
                    {/* Left tables stack */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* POS USER Statistics Card */}
                        <Card className="glass-card border border-slate-200/60 dark:border-slate-800/60">
                            <CardHeader className="bg-gradient-to-r from-primary to-primary-hover text-white py-3.5 px-5 rounded-t-lg flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold tracking-wide">POS User</CardTitle>
                                <UserCheck className="size-4" />
                            </CardHeader>
                            <CardContent className="p-4">
                                {posUsers.length === 0 ? (
                                    <div className="text-center text-slate-500 py-6 text-sm">
                                        No POS User voucher logs found.
                                    </div>
                                ) : (
                                    <>
                                        {/* Desktop Table View */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50">
                                                        <TableHead className="font-bold text-slate-700">Seller</TableHead>
                                                        <TableHead className="font-bold text-slate-700">Voucher</TableHead>
                                                        <TableHead className="font-bold text-slate-700">Used</TableHead>
                                                        <TableHead className="font-bold text-slate-700">Stock</TableHead>
                                                        <TableHead className="font-bold text-slate-700">Damage/Return</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {posUsers.map((u, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell className="font-semibold text-slate-700">{u.generated_for}</TableCell>
                                                            <TableCell>
                                                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 border rounded-full px-2.5 py-0.5 hover:bg-blue-100">
                                                                    {u.total_generated_for}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border rounded-full px-2.5 py-0.5 hover:bg-emerald-100">
                                                                    {u.matching_codes}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className="bg-amber-50 text-amber-700 border-amber-200 border rounded-full px-2.5 py-0.5 hover:bg-amber-100">
                                                                    {u.total_generated_for - u.matching_codes - u.expired_codes}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className="bg-rose-50 text-rose-700 border-rose-200 border rounded-full px-2.5 py-0.5 hover:bg-rose-100">
                                                                    {u.expired_codes}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden grid gap-4 sm:grid-cols-2">
                                            {posUsers.map((u, i) => (
                                                <div key={i} className="bg-white dark:bg-card border rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between gap-3 hover:shadow-sm transition-all">
                                                    <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                                                        <span className="font-bold text-slate-800 dark:text-slate-100">{u.generated_for}</span>
                                                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 border rounded-full text-xs font-semibold px-2 py-0.5">
                                                            {u.total_generated_for} Vouchers
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                        <div className="p-2 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                            <div className="font-bold">{u.matching_codes}</div>
                                                            <div className="text-[10px] text-muted-foreground font-medium">Used</div>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                            <div className="font-bold">{u.total_generated_for - u.matching_codes - u.expired_codes}</div>
                                                            <div className="text-[10px] text-muted-foreground font-medium">Stock</div>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-rose-500/5 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                                            <div className="font-bold">{u.expired_codes}</div>
                                                            <div className="text-[10px] text-muted-foreground font-medium">Damage</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
 
                        {/* Voucher Allocation Summary Card */}
                        <Card className="glass-card border border-slate-200/60 dark:border-slate-800/60">
                            <CardHeader className="bg-gradient-to-r from-primary to-primary-hover text-white py-3.5 px-5 rounded-t-lg flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold tracking-wide">Voucher Allocation Summary</CardTitle>
                                <Button asChild size="xs" className="bg-white text-primary hover:bg-slate-100 font-extrabold text-[10px]">
                                    <Link to="/vouchers/allocate">
                                        <Plus className="size-3 mr-1" /> Allocate Voucher
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4">
                                {allocations.length === 0 ? (
                                    <div className="text-center text-slate-500 py-6 text-sm">
                                        No allocated voucher summaries found.
                                    </div>
                                ) : (
                                    <>
                                        {/* Desktop Table View */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50">
                                                        <TableHead className="w-12 font-bold text-slate-700">S.N.</TableHead>
                                                        <TableHead className="font-bold text-slate-700">Voucher Collector</TableHead>
                                                        <TableHead className="font-bold text-slate-700">Total Voucher</TableHead>
                                                        <TableHead className="font-bold text-slate-700">Used Voucher</TableHead>
                                                        <TableHead className="font-bold text-slate-700">Unused Voucher</TableHead>
                                                        <TableHead className="font-bold text-slate-700">ID Start At</TableHead>
                                                        <TableHead className="font-bold text-slate-700">ID End At</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {allocations.map((a, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell className="text-slate-500">{i + 1}</TableCell>
                                                            <TableCell className="font-semibold text-slate-700">{a.allocation}</TableCell>
                                                            <TableCell>
                                                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 border rounded-full px-2.5 py-0.5">
                                                                    {a.count}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border rounded-full px-2.5 py-0.5">
                                                                    {a.matching_users}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className="bg-amber-50 text-amber-700 border-amber-200 border rounded-full px-2.5 py-0.5">
                                                                    {a.count - a.matching_users}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">{a.first_id}</TableCell>
                                                            <TableCell className="font-mono text-xs">{a.last_id}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden grid gap-4 sm:grid-cols-2">
                                            {allocations.map((a, i) => (
                                                <div key={i} className="bg-white dark:bg-card border rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between gap-3 hover:shadow-sm transition-all">
                                                    <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-muted-foreground bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded">
                                                                #{i + 1}
                                                            </span>
                                                            <span className="font-bold text-slate-800 dark:text-slate-100">{a.allocation}</span>
                                                        </div>
                                                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 border rounded-full text-xs font-semibold px-2 py-0.5">
                                                            {a.count} Total
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                                        <div className="p-2 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                            <div className="font-bold">{a.matching_users}</div>
                                                            <div className="text-[10px] text-muted-foreground font-medium">Used</div>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                            <div className="font-bold">{a.count - a.matching_users}</div>
                                                            <div className="text-[10px] text-muted-foreground font-medium">Unused</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t pt-2 border-slate-100 dark:border-slate-800 font-mono">
                                                        <span>Start ID: {a.first_id}</span>
                                                        <span>End ID: {a.last_id}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right column: Activity Log */}
                    <div className="lg:col-span-4">
                        <Card className="glass-card border border-slate-200/60 dark:border-slate-800/60 h-full">
                            <CardHeader className="border-b py-3 px-5 bg-slate-50/50 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold text-slate-800">Activity Log</CardTitle>
                                <Clock className="size-4 text-slate-400" />
                            </CardHeader>
                            <CardContent className="p-5">
                                {activityLogs.length === 0 ? (
                                    <div className="text-center text-slate-500 py-6 text-sm">
                                        No recent activities.
                                    </div>
                                ) : (
                                    <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-6">
                                        {activityLogs.map((log) => (
                                            <div key={log.id} className="relative space-y-1">
                                                {/* Bullet Point Dot */}
                                                <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-indigo-600 border border-white ring-2 ring-indigo-50" />
                                                
                                                <div className="text-[10px] text-slate-400 font-bold">
                                                    {formatRelativeTime(log.date)}
                                                </div>
                                                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                                                    {log.description}
                                                </p>
                                                {log.username && (
                                                    <div className="text-[10px] text-slate-400 italic">
                                                        by {log.username}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>

            </div>
        </AppLayout>
    );
}
