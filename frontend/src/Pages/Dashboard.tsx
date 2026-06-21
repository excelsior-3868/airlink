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
                        <Card className="shadow-xs border bg-indigo-50/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-indigo-100">
                                <CardTitle className="text-sm font-semibold text-indigo-950">Total Vouchers</CardTitle>
                               <Ticket className="size-4 text-indigo-600" />
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-indigo-950">{fmt.format(posStats.vouchersCount)}</div>
                                <p className="text-xs text-indigo-700">assigned to you</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-xs border bg-emerald-50/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-emerald-100">
                                <CardTitle className="text-sm font-semibold text-emerald-950">Used Vouchers</CardTitle>
                                <Wifi className="size-4 text-emerald-600" />
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-emerald-950">{fmt.format(posStats.usedVouchers)}</div>
                                <p className="text-xs text-emerald-700">recharged successfully</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-xs border bg-sky-50/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-sky-100">
                                <CardTitle className="text-sm font-semibold text-sky-950">Unused Vouchers</CardTitle>
                                <CreditCard className="size-4 text-sky-600" />
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-sky-950">
                                    {fmt.format(posStats.vouchersCount - posStats.usedVouchers)}
                                </div>
                                <p className="text-xs text-sky-700">available to sell</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-xs border bg-amber-50/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-amber-100">
                                <CardTitle className="text-sm font-semibold text-amber-950">PPPoE Accounts</CardTitle>
                                <Users className="size-4 text-amber-600" />
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-amber-950">{fmt.format(posStats.userNoPpp)}</div>
                                <p className="text-xs text-amber-700">total active recharges</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Voucher Allocations Summary */}
                    <Card className="shadow-sm border">
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Voucher Collector</TableHead>
                                        <TableHead>Total Count</TableHead>
                                        <TableHead>Used Vouchers</TableHead>
                                        <TableHead>Unused Vouchers</TableHead>
                                        <TableHead>ID Range</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allocations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-slate-500 py-4">
                                                No allocated voucher batches found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        allocations.map((a, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-semibold">{a.allocation}</TableCell>
                                                <TableCell>{a.count}</TableCell>
                                                <TableCell className="text-emerald-600 font-semibold">{a.matching_users}</TableCell>
                                                <TableCell className="text-slate-600 font-semibold">{a.count - a.matching_users}</TableCell>
                                                <TableCell className="font-mono text-xs text-slate-500">
                                                    ID {a.first_id} - ID {a.last_id}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
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
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Hotspot Overview</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl overflow-hidden shadow-xs flex flex-col justify-between text-white h-32 bg-[#3c8dbc] hover:shadow-md transition-shadow">
                            <div className="p-4 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold uppercase tracking-wider text-sky-100">Total Voucher</div>
                                    <div className="text-2xl font-extrabold">{stats ? fmt.format(stats.totalVouchers) : 0}</div>
                                </div>
                                <CreditCard className="size-8 text-sky-100/50" />
                            </div>
                            <div className="bg-black/10 px-4 py-2 text-right">
                                <Link to="/vouchers" className="text-[10px] font-extrabold uppercase text-sky-100 hover:text-white inline-flex items-center gap-1">
                                    View Reports <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-xl overflow-hidden shadow-xs flex flex-col justify-between text-white h-32 bg-[#fd8849] hover:shadow-md transition-shadow">
                            <div className="p-4 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold uppercase tracking-wider text-orange-100">Active Hotspot</div>
                                    <div className="text-2xl font-extrabold">{stats ? fmt.format(stats.activeHotspot) : 0}</div>
                                </div>
                                <LockOpen className="size-8 text-orange-100/50" />
                            </div>
                            <div className="bg-black/10 px-4 py-2 text-right">
                                <Link to="/vouchers" className="text-[10px] font-extrabold uppercase text-orange-100 hover:text-white inline-flex items-center gap-1">
                                    View Reports <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-xl overflow-hidden shadow-xs flex flex-col justify-between text-white h-32 bg-[#ff6b81] hover:shadow-md transition-shadow">
                            <div className="p-4 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold uppercase tracking-wider text-rose-100">Used/Expired Voucher</div>
                                    <div className="text-2xl font-extrabold">{stats ? fmt.format(stats.usedExpiredVouchers) : 0}</div>
                                </div>
                                <Lock className="size-8 text-rose-100/50" />
                            </div>
                            <div className="bg-black/10 px-4 py-2 text-right">
                                <Link to="/vouchers" className="text-[10px] font-extrabold uppercase text-rose-100 hover:text-white inline-flex items-center gap-1">
                                    View Reports <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-xl overflow-hidden shadow-xs flex flex-col justify-between text-white h-32 bg-[#00d1b2] hover:shadow-md transition-shadow">
                            <div className="p-4 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold uppercase tracking-wider text-teal-100">Damaged/Returned Voucher</div>
                                    <div className="text-2xl font-extrabold">{stats ? fmt.format(stats.damagedReturnedVouchers) : '0000'}</div>
                                </div>
                                <CreditCard className="size-8 text-teal-100/50" />
                            </div>
                            <div className="bg-black/10 px-4 py-2 text-right">
                                <Link to="/vouchers" className="text-[10px] font-extrabold uppercase text-teal-100 hover:text-white inline-flex items-center gap-1">
                                    View Reports <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Blue Separator Bar */}
                <div className="h-1 bg-[#003164] w-full rounded-sm" />

                {/* PPPoE Row */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">PPPoE Overview</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl overflow-hidden shadow-xs flex flex-col justify-between text-white h-32 bg-[#3c8dbc] hover:shadow-md transition-shadow">
                            <div className="p-4 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold uppercase tracking-wider text-sky-100">Total PPPOE Users</div>
                                    <div className="text-2xl font-extrabold">{stats ? fmt.format(stats.totalPppoeUsers) : 0}</div>
                                </div>
                                <Users className="size-8 text-sky-100/50" />
                            </div>
                            <div className="bg-black/10 px-4 py-2 text-right">
                                <Link to="/customers/pppoe" className="text-[10px] font-extrabold uppercase text-sky-100 hover:text-white inline-flex items-center gap-1">
                                    View Reports <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-xl overflow-hidden shadow-xs flex flex-col justify-between text-white h-32 bg-[#fd8849] hover:shadow-md transition-shadow">
                            <div className="p-4 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold uppercase tracking-wider text-orange-100">Active PPPOE</div>
                                    <div className="text-2xl font-extrabold">{stats ? fmt.format(stats.activePppoe) : 0}</div>
                                </div>
                                <Eye className="size-8 text-orange-100/50" />
                            </div>
                            <div className="bg-black/10 px-4 py-2 text-right">
                                <Link to="/customers/pppoe" className="text-[10px] font-extrabold uppercase text-orange-100 hover:text-white inline-flex items-center gap-1">
                                    View Reports <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-xl overflow-hidden shadow-xs flex flex-col justify-between text-white h-32 bg-[#ff6b81] hover:shadow-md transition-shadow">
                            <div className="p-4 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold uppercase tracking-wider text-rose-100">Expired User</div>
                                    <div className="text-2xl font-extrabold">{stats ? fmt.format(stats.expiredUsers) : '0000'}</div>
                                </div>
                                <Trash2 className="size-8 text-rose-100/50" />
                            </div>
                            <div className="bg-black/10 px-4 py-2 text-right">
                                <Link to="/customers/pppoe?expiry_range=expired" className="text-[10px] font-extrabold uppercase text-rose-100 hover:text-white inline-flex items-center gap-1">
                                    View Reports <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-xl overflow-hidden shadow-xs flex flex-col justify-between text-white h-32 bg-[#00d1b2] hover:shadow-md transition-shadow">
                            <div className="p-4 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold uppercase tracking-wider text-teal-100">Disabled User</div>
                                    <div className="text-2xl font-extrabold">{stats ? fmt.format(stats.disabledUsers) : '0000'}</div>
                                </div>
                                <EyeOff className="size-8 text-teal-100/50" />
                            </div>
                            <div className="bg-black/10 px-4 py-2 text-right">
                                <Link to="/customers?status=disable" className="text-[10px] font-extrabold uppercase text-teal-100 hover:text-white inline-flex items-center gap-1">
                                    View Reports <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tables Grid */}
                <div className="grid gap-6 lg:grid-cols-12">
                    
                    {/* Left tables stack */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* POS USER Statistics Card */}
                        <Card className="border shadow-xs">
                            <CardHeader className="bg-gradient-to-r from-[#003164] to-[#004b96] text-white py-3.5 px-5 rounded-t-lg flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider">POS User</CardTitle>
                                <UserCheck className="size-4" />
                            </CardHeader>
                            <CardContent className="p-4 overflow-x-auto">
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
                                        {posUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-slate-500">
                                                    No POS User voucher logs found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            posUsers.map((u, i) => (
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
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Voucher Allocation Summary Card */}
                        <Card className="border shadow-xs">
                            <CardHeader className="bg-gradient-to-r from-[#003164] to-[#004b96] text-white py-3.5 px-5 rounded-t-lg flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider">Voucher Allocation Summary</CardTitle>
                                <Button asChild size="xs" className="bg-white text-[#003164] hover:bg-slate-100 font-extrabold uppercase text-[10px]">
                                    <Link to="/vouchers/allocate">
                                        <Plus className="size-3 mr-1" /> Allocate Voucher
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="w-12 font-bold text-slate-700">S.N.</TableHead>
                                            <TableHead className="font-bold text-slate-700">Voucher Collector</TableHead>
                                            <TableHead className="font-bold text-slate-700">Total Voucher</TableHead>
                                            <TableHead className="font-bold text-slate-700">Used Voucher</TableHead>
                                            <TableHead className="font-bold text-slate-700">Unused Voucher</TableHead>
                                            <TableHead className="font-bold text-slate-700">Id Start At</TableHead>
                                            <TableHead className="font-bold text-slate-700">Id End At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allocations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-slate-500">
                                                    No allocated voucher summaries found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            allocations.map((a, i) => (
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
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right column: Activity Log */}
                    <div className="lg:col-span-4">
                        <Card className="border shadow-xs h-full">
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
