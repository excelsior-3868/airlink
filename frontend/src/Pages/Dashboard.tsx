import { useEffect, useState } from 'react';

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
import { motion } from 'framer-motion';

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
    username: string;
    description: string;
    date: string;
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
                    setSadmin(res.data.sadmin);
                    setPosStats(res.data.stats);
                    setAllocations(res.data.stats.allocations || []);
                    setLoading(false);
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
                    <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin">
                            <div className="w-4 h-4 bg-primary/20 rounded-full animate-ping" />
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout title="Dashboard">
                <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
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
                    <div className="surface-panel border border-border/50 rounded-2xl p-5 shadow-xs">
                        <h2 className="text-xl font-heading font-bold text-slate-800 dark:text-slate-100">Welcome, {sadmin}</h2>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">Access your voucher batches and allocate tickets below.</p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                        <motion.div
                            className="glass-card p-5 flex flex-col gap-2 rounded-[24px]"
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Vouchers</span>
                                <div className="icon-badge h-9 w-9"><Ticket className="size-4" /></div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold font-heading text-[#001D4A] dark:text-[#a5c5ff]">{fmt.format(posStats.vouchersCount)}</div>
                                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">assigned to you</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="glass-card p-5 flex flex-col gap-2 rounded-[24px]"
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Used Vouchers</span>
                                <div className="icon-badge h-9 w-9"><Wifi className="size-4" /></div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold font-heading text-[#059669] dark:text-[#34d399]">{fmt.format(posStats.usedVouchers)}</div>
                                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">recharged successfully</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="glass-card p-5 flex flex-col gap-2 rounded-[24px]"
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Unused Vouchers</span>
                                <div className="icon-badge h-9 w-9"><CreditCard className="size-4" /></div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold font-heading text-[#EA580C] dark:text-[#fb923c]">
                                    {fmt.format(posStats.vouchersCount - posStats.usedVouchers)}
                                </div>
                                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">available to sell</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="glass-card p-5 flex flex-col gap-2 rounded-[24px]"
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">PPPoE Accounts</span>
                                <div className="icon-badge h-9 w-9"><Users className="size-4" /></div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold font-heading text-[#7C3AED] dark:text-[#c084fc]">{fmt.format(posStats.userNoPpp)}</div>
                                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">total active recharges</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Voucher Allocations Summary */}
                    <div className="glass-card overflow-hidden">
                        <div className="border-b border-border/50 px-6 py-5 flex items-center justify-between bg-white/50">
                            <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 text-lg">Allocated Voucher Batches</h4>
                            <Link
                                to="/vouchers/allocate"
                                className="inline-flex items-center gap-1 text-primary font-bold text-xs hover:underline"
                            >
                                Allocate Voucher <ArrowRight className="size-3" />
                            </Link>
                        </div>
                        <div className="p-0">
                            {allocations.length === 0 ? (
                                <div className="text-center text-slate-500 py-8 text-sm font-medium">
                                    No allocated voucher batches found.
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-b-0 hover:bg-transparent">
                                                    <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Voucher Collector</TableHead>
                                                    <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Total Count</TableHead>
                                                    <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Used Vouchers</TableHead>
                                                    <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Unused Vouchers</TableHead>
                                                    <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">ID Range</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {allocations.map((a, i) => (
                                                    <TableRow key={i} className="border-b border-border/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                                        <TableCell className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{a.allocation}</TableCell>
                                                        <TableCell className="px-6 py-4 font-medium">{a.count}</TableCell>
                                                        <TableCell className="px-6 py-4 text-emerald-600 font-bold dark:text-emerald-400">{a.matching_users}</TableCell>
                                                        <TableCell className="px-6 py-4 text-slate-650 font-bold dark:text-slate-350">{a.count - a.matching_users}</TableCell>
                                                        <TableCell className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                                                            ID {a.first_id} - ID {a.last_id}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden grid gap-4 p-4 sm:grid-cols-2">
                                        {allocations.map((a, i) => (
                                            <div key={i} className="bg-white/60 dark:bg-slate-900/50 border rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between gap-3 hover:shadow-sm transition-all">
                                                <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-850">
                                                    <span className="font-bold text-slate-800 dark:text-slate-100">{a.allocation}</span>
                                                    <span className="pill secondary py-0.5 px-2 text-[10px] uppercase font-bold">
                                                        {a.count} Total
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                                    <div className="p-2 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                        <div className="font-bold">{a.matching_users}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold">Used</div>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                        <div className="font-bold">{a.count - a.matching_users}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold">Unused</div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-muted-foreground border-t pt-2 border-slate-100 dark:border-slate-850 font-mono text-center">
                                                    ID Range: ID {a.first_id} - ID {a.last_id}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Render Standard Admin/Sales Dashboard View
    return (
        <AppLayout title="Dashboard">
            <div className="space-y-6">
                


                {/* Hotspot Row */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Hotspot Overview</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Link
                                to="/vouchers"
                                className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-[24px] p-5 flex items-center justify-between h-28 group cursor-pointer no-underline"
                            >
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground">Total Voucher</div>
                                    <div className="text-2xl font-bold font-heading text-[#001D4A] dark:text-[#a5c5ff]">{stats ? fmt.format(stats.totalVouchers) : 0}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 dark:text-sky-400 group-hover:scale-110 transition-transform duration-200">
                                    <CreditCard className="size-6" />
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Link
                                to="/vouchers"
                                className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-[24px] p-5 flex items-center justify-between h-28 group cursor-pointer no-underline"
                            >
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground">Active Hotspot</div>
                                    <div className="text-2xl font-bold font-heading text-[#7C3AED] dark:text-[#c084fc]">{stats ? fmt.format(stats.activeHotspot) : 0}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform duration-200">
                                    <LockOpen className="size-6" />
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Link
                                to="/vouchers"
                                className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-[24px] p-5 flex items-center justify-between h-28 group cursor-pointer no-underline"
                            >
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground">Used/Expired Voucher</div>
                                    <div className="text-2xl font-bold font-heading text-[#EA580C] dark:text-[#fb923c]">{stats ? fmt.format(stats.usedExpiredVouchers) : 0}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform duration-200">
                                    <Lock className="size-6" />
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Link
                                to="/vouchers"
                                className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-[24px] p-5 flex items-center justify-between h-28 group cursor-pointer no-underline"
                            >
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground">Damaged/Returned Voucher</div>
                                    <div className="text-2xl font-bold font-heading text-[#059669] dark:text-[#34d399]">{stats ? fmt.format(stats.damagedReturnedVouchers) : 0}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-500 dark:text-teal-400 group-hover:scale-110 transition-transform duration-200">
                                    <CreditCard className="size-6" />
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* PPPoE Row */}
                <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">PPPoE Overview</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Link
                                to="/customers/pppoe"
                                className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-[24px] p-5 flex items-center justify-between h-28 group cursor-pointer no-underline"
                            >
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground">Total PPPoE Users</div>
                                    <div className="text-2xl font-bold font-heading text-[#001D4A] dark:text-[#a5c5ff]">{stats ? fmt.format(stats.totalPppoeUsers) : 0}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 dark:text-sky-400 group-hover:scale-110 transition-transform duration-200">
                                    <Users className="size-6" />
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Link
                                to="/customers/pppoe"
                                className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-[24px] p-5 flex items-center justify-between h-28 group cursor-pointer no-underline"
                            >
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground">Active PPPoE</div>
                                    <div className="text-2xl font-bold font-heading text-[#7C3AED] dark:text-[#c084fc]">{stats ? fmt.format(stats.activePppoe) : 0}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform duration-200">
                                    <Eye className="size-6" />
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Link
                                to="/customers/pppoe?expiry_range=expired"
                                className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-[24px] p-5 flex items-center justify-between h-28 group cursor-pointer no-underline"
                            >
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground">Expired User</div>
                                    <div className="text-2xl font-bold font-heading text-[#EA580C] dark:text-[#fb923c]">{stats ? fmt.format(stats.expiredUsers) : 0}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform duration-200">
                                    <Trash2 className="size-6" />
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Link
                                to="/customers?status=disable"
                                className="glass-card border border-slate-200/60 dark:border-slate-800/60 rounded-[24px] p-5 flex items-center justify-between h-28 group cursor-pointer no-underline"
                            >
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground">Disabled User</div>
                                    <div className="text-2xl font-bold font-heading text-[#059669] dark:text-[#34d399]">{stats ? fmt.format(stats.disabledUsers) : 0}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-500 dark:text-teal-400 group-hover:scale-110 transition-transform duration-200">
                                    <EyeOff className="size-6" />
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Tables Grid */}
                <div className="grid gap-6 lg:grid-cols-12 pt-2">
                    
                    {/* Left tables stack */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* POS USER Statistics Card */}
                        <div className="glass-card overflow-hidden">
                            <div className="border-b border-border/50 py-4 px-6 flex flex-row items-center justify-between bg-white/50">
                                <h4 className="font-heading font-bold text-slate-850 dark:text-slate-100 text-lg">POS User</h4>
                                <UserCheck className="size-5 text-slate-400" />
                            </div>
                            <div className="p-0">
                                {posUsers.length === 0 ? (
                                    <div className="text-center text-slate-500 py-8 text-sm font-medium">
                                        No POS User voucher logs found.
                                    </div>
                                ) : (
                                    <>
                                        {/* Desktop Table View */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-b-0 hover:bg-transparent">
                                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Seller</TableHead>
                                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Voucher</TableHead>
                                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Used</TableHead>
                                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Stock</TableHead>
                                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Damage/Return</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {posUsers.map((u, i) => (
                                                        <TableRow key={i} className="border-b border-border/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                                            <TableCell className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{u.generated_for}</TableCell>
                                                            <TableCell className="px-6 py-4">
                                                                <span className="pill secondary py-0.5 px-2 text.semibold hover:bg-blue-100">
                                                                    {u.total_generated_for}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4">
                                                                <span className="pill success py-0.5 px-2 text.semibold hover:bg-emerald-100">
                                                                    {u.matching_codes}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4">
                                                                <span className="pill warning py-0.5 px-2 text.semibold hover:bg-amber-100">
                                                                    {u.total_generated_for - u.matching_codes - u.expired_codes}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4">
                                                                <span className="pill danger py-0.5 px-2 text.semibold hover:bg-rose-100">
                                                                    {u.expired_codes}
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden grid gap-4 p-4 sm:grid-cols-2">
                                            {posUsers.map((u, i) => (
                                                <div key={i} className="bg-white/60 dark:bg-slate-900/50 border rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between gap-3 hover:shadow-sm transition-all">
                                                    <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-850">
                                                        <span className="font-bold text-slate-800 dark:text-slate-100">{u.generated_for}</span>
                                                        <span className="pill secondary py-0.5 px-2 text-[10px] font-bold">
                                                            {u.total_generated_for} Vouchers
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                        <div className="p-2 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                            <div className="font-bold">{u.matching_codes}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold">Used</div>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                            <div className="font-bold">{u.total_generated_for - u.matching_codes - u.expired_codes}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold">Stock</div>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-rose-500/5 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                                            <div className="font-bold">{u.expired_codes}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold">Damage</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
 
                        {/* Voucher Allocation Summary Card */}
                        <div className="glass-card overflow-hidden">
                            <div className="border-b border-border/50 py-4 px-6 flex flex-row items-center justify-between bg-white/50">
                                <h4 className="font-heading font-bold text-slate-850 dark:text-slate-100 text-lg">Voucher Allocation Summary</h4>
                                <Link
                                    to="/vouchers/allocate"
                                    className="no-underline inline-flex items-center justify-center btn-primary h-9 px-4 text-xs font-semibold"
                                >
                                    <Plus className="size-4 mr-1" /> Allocate Voucher
                                </Link>
                            </div>
                            <div className="p-0">
                                {allocations.length === 0 ? (
                                    <div className="text-center text-slate-500 py-8 text-sm font-medium">
                                        No allocated voucher summaries found.
                                    </div>
                                ) : (
                                    <>
                                        {/* Desktop Table View */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-b-0 hover:bg-transparent">
                                                        <TableHead className="w-16 px-6 py-3 font-semibold text-xs tracking-wider uppercase">S.N.</TableHead>
                                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Voucher Collector</TableHead>
                                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Total Voucher</TableHead>
                                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Used Voucher</TableHead>
                                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Unused Voucher</TableHead>
                                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">ID Start At</TableHead>
                                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">ID End At</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {allocations.map((a, i) => (
                                                        <TableRow key={i} className="border-b border-border/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                                            <TableCell className="px-6 py-4 text-slate-400 font-mono text-xs">{i + 1}</TableCell>
                                                            <TableCell className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{a.allocation}</TableCell>
                                                            <TableCell className="px-6 py-4">
                                                                <span className="pill secondary py-0.5 px-2">
                                                                    {a.count}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4">
                                                                <span className="pill success py-0.5 px-2">
                                                                    {a.matching_users}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4">
                                                                <span className="pill warning py-0.5 px-2">
                                                                    {a.count - a.matching_users}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4 font-mono text-xs">{a.first_id}</TableCell>
                                                            <TableCell className="px-6 py-4 font-mono text-xs">{a.last_id}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden grid gap-4 p-4 sm:grid-cols-2">
                                            {allocations.map((a, i) => (
                                                <div key={i} className="bg-white/60 dark:bg-slate-900/50 border rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between gap-3 hover:shadow-sm transition-all">
                                                    <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-850">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                                #{i + 1}
                                                            </span>
                                                            <span className="font-bold text-slate-800 dark:text-slate-100">{a.allocation}</span>
                                                        </div>
                                                        <span className="pill secondary py-0.5 px-2 text-[10px] font-bold">
                                                            {a.count} Total
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                                        <div className="p-2 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                            <div className="font-bold">{a.matching_users}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold">Used</div>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                            <div className="font-bold">{a.count - a.matching_users}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold">Unused</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t pt-2 border-slate-100 dark:border-slate-850 font-mono">
                                                        <span>Start ID: {a.first_id}</span>
                                                        <span>End ID: {a.last_id}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right column: Activity Log */}
                    <div className="lg:col-span-4">
                        <div className="glass-card border border-slate-200/60 dark:border-slate-800/60 h-full flex flex-col">
                            <div className="border-b border-border/50 py-4 px-6 flex flex-row items-center justify-between bg-white/50">
                                <h4 className="font-heading font-bold text-slate-850 dark:text-slate-100 text-lg">Activity Log</h4>
                                <Clock className="size-5 text-slate-400" />
                            </div>
                            <div className="p-5 flex-grow">
                                {activityLogs.length === 0 ? (
                                    <div className="text-center text-slate-500 py-8 text-sm font-medium">
                                        No recent activities.
                                    </div>
                                ) : (
                                    <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-6">
                                        {activityLogs.map((log) => (
                                            <div key={log.id} className="relative space-y-1">
                                                {/* Bullet Point Dot */}
                                                <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-primary border border-white dark:border-slate-900 ring-2 ring-primary/10" />
                                                
                                                <div className="text-[10px] text-slate-400 font-bold">
                                                    {formatRelativeTime(log.date)}
                                                </div>
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
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
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </AppLayout>
    );
}
