import { useEffect, useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import api from '@/lib/api';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Calendar, Download, RefreshCw, Upload, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface CustomerStats {
    username: string;
    fullname: string;
    profile: string | null;
    type: string | null;
    validity: number | null;
    validity_unit: string | null;
}

interface ActiveRecharge {
    id: number;
    plan_name: string;
    recharged_on: string;
    expiration: string;
    time: string;
    status: string;
    type: string;
}

interface TrafficUsage {
    upload: number;
    download: number;
    total: number;
}

interface Transaction {
    invoice: string;
    plan_name: string;
    price: string;
    recharged_on: string;
    expiration: string;
    type: string;
}

const fmtBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function CustomerDashboard() {
    const [customer, setCustomer] = useState<CustomerStats | null>(null);
    const [activeRecharge, setActiveRecharge] = useState<ActiveRecharge | null>(null);
    const [traffic, setTraffic] = useState<TrafficUsage | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await api.get('/customer/dashboard');
            setCustomer(res.data.customer);
            setActiveRecharge(res.data.active_recharge);
            setTraffic(res.data.traffic_usage);
            setTransactions(res.data.transactions);
        } catch (e) {
            toast.error('Failed to load dashboard statistics.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading) {
        return (
            <CustomerLayout title="Subscriber Dashboard">
                <div className="flex h-64 items-center justify-center">
                    <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin">
                            <div className="w-4 h-4 bg-primary/20 rounded-full animate-ping" />
                        </div>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    const isExpired = () => {
        if (!activeRecharge) return true;
        const expiry = new Date(activeRecharge.expiration);
        return new Date() > expiry;
    };

    return (
        <CustomerLayout title="Subscriber Dashboard">
            <div className="flex flex-col gap-6">
                {/* Welcome bar - Styled as surface panel */}
                <div className="surface-panel flex items-center justify-between border border-border/50 rounded-2xl p-5">
                    <div>
                        <h3 className="font-heading font-bold text-slate-800 dark:text-slate-100 text-lg leading-snug">
                            Welcome, {customer?.fullname || customer?.username}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">Username: {customer?.username}</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="rounded-xl border border-white/60 bg-white/70 p-2.5 hover:bg-slate-100 hover:text-slate-850 active:scale-95 transition-all shadow-sm text-slate-650 cursor-pointer"
                        disabled={refreshing}
                    >
                        <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Info Cards - Styled as glass cards */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <motion.div
                        className="glass-card p-5 flex flex-col gap-3 rounded-[24px] cursor-pointer"
                        whileHover={{ y: -4, scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Account Plan
                            </span>
                            <div className="icon-badge h-9 w-9">
                                <Wifi className="size-4" />
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            {activeRecharge ? (
                                <>
                                    <div className="text-xl font-bold font-heading text-[#001D4A] dark:text-[#a5c5ff]">
                                        {activeRecharge.plan_name}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                        Type: <span className="pill secondary py-0.5 px-2 text-[10px] uppercase font-bold">{activeRecharge.type}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                        Status:{' '}
                                        <span
                                            className={`pill py-0.5 px-2 text-[10px] uppercase font-bold ${
                                                isExpired() ? 'danger' : 'success'
                                            }`}
                                        >
                                            {isExpired() ? 'Expired' : 'Active'}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="py-2 text-sm text-slate-550 font-medium">No active package. Please recharge.</div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        className="glass-card p-5 flex flex-col gap-3 rounded-[24px] cursor-pointer"
                        whileHover={{ y: -4, scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Expiration Details
                            </span>
                            <div className="icon-badge h-9 w-9">
                                <Calendar className="size-4" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            {activeRecharge ? (
                                <>
                                    <div className="text-xl font-bold font-heading text-[#7C3AED] dark:text-[#c084fc]">
                                        {activeRecharge.expiration}
                                    </div>
                                    <p className="text-xs text-slate-500 font-semibold">Recharged: {activeRecharge.recharged_on}</p>
                                    <p className="text-xs text-slate-500 font-semibold">Expiry Time: {activeRecharge.time}</p>
                                </>
                            ) : (
                                <div className="py-2 text-sm text-slate-550 font-medium">N/A</div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        className="glass-card p-5 flex flex-col gap-3 rounded-[24px] sm:col-span-2 lg:col-span-1 cursor-pointer"
                        whileHover={{ y: -4, scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Data Traffic Usage
                            </span>
                            <div className="icon-badge h-9 w-9">
                                <Activity className="size-4" />
                            </div>
                        </div>
                        <div className="space-y-3 pt-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                                    <Upload className="size-3 text-emerald-500" /> Uploaded:
                                </span>
                                <strong className="text-slate-800 dark:text-slate-200 font-semibold">{fmtBytes(traffic?.upload || 0)}</strong>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                                    <Download className="size-3 text-blue-500" /> Downloaded:
                                </span>
                                <strong className="text-slate-800 dark:text-slate-200 font-semibold">{fmtBytes(traffic?.download || 0)}</strong>
                            </div>
                            <div className="border-t border-border/50 pt-2 flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-700 dark:text-slate-300">Total Usage:</span>
                                <strong className="text-[#059669] dark:text-[#34d399] font-black">{fmtBytes(traffic?.total || 0)}</strong>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Billing Transactions - Styled as glass card table */}
                <div className="glass-card overflow-hidden mt-4">
                    <div className="border-b border-border/50 px-6 py-5">
                        <h4 className="font-bold font-heading text-primary dark:text-white text-lg">Recent Recharge Transactions</h4>
                    </div>
                    <div className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b-0 hover:bg-transparent">
                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Invoice</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Plan</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Type</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Recharge Date</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Expiration Date</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase text-right">Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-slate-500 py-8 text-sm font-medium">
                                                No transaction records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.map((t) => (
                                            <TableRow key={t.invoice} className="border-b border-border/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                                <TableCell className="px-6 py-4 font-mono font-bold text-primary dark:text-blue-400 text-xs">
                                                    {t.invoice}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                                    {t.plan_name}
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <span className="pill secondary py-0.5 px-2 text-[10px] uppercase font-bold">
                                                        {t.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                    {t.recharged_on}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                    {t.expiration}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                                                    NPR {t.price}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
