import { useEffect, useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Calendar, Download, RefreshCw, Upload, Wifi } from 'lucide-react';
import { toast } from 'sonner';

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
            <CustomerLayout title="Dashboard">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
                {/* Welcome bar */}
                <div className="flex items-center justify-between bg-slate-50 border rounded-xl p-4">
                    <div>
                        <h3 className="font-semibold text-slate-800">Welcome, {customer?.fullname || customer?.username}</h3>
                        <p className="text-xs text-slate-500">Username: {customer?.username}</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="rounded-md border p-2 hover:bg-slate-100 transition shadow-sm text-slate-600"
                        disabled={refreshing}
                    >
                        <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Info Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="shadow-sm border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                            <CardTitle className="text-sm font-semibold text-slate-700">Account Plan</CardTitle>
                            <Wifi className="size-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent className="pt-4">
                            {activeRecharge ? (
                                <div className="space-y-2">
                                    <div className="text-xl font-bold text-slate-800">{activeRecharge.plan_name}</div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        Type: <Badge variant="secondary">{activeRecharge.type}</Badge>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        Status:{' '}
                                        <Badge
                                            className={
                                                isExpired()
                                                    ? 'bg-rose-500 hover:bg-rose-600'
                                                    : 'bg-emerald-500 hover:bg-emerald-600'
                                            }
                                        >
                                            {isExpired() ? 'Expired' : 'Active'}
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-2 text-sm text-slate-500">No active package. Please recharge.</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                            <CardTitle className="text-sm font-semibold text-slate-700">Expiration Details</CardTitle>
                            <Calendar className="size-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent className="pt-4">
                            {activeRecharge ? (
                                <div className="space-y-2">
                                    <div className="text-xl font-bold text-slate-800">{activeRecharge.expiration}</div>
                                    <p className="text-xs text-slate-500">Recharged: {activeRecharge.recharged_on}</p>
                                    <p className="text-xs text-slate-500">Expiry Time: {activeRecharge.time}</p>
                                </div>
                            ) : (
                                <div className="py-2 text-sm text-slate-500">N/A</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border sm:col-span-2 lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                            <CardTitle className="text-sm font-semibold text-slate-700">Data Traffic Usage</CardTitle>
                            <Activity className="size-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 flex items-center gap-1">
                                    <Upload className="size-3 text-emerald-500" /> Uploaded:
                                </span>
                                <strong className="text-slate-800 font-semibold">{fmtBytes(traffic?.upload || 0)}</strong>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 flex items-center gap-1">
                                    <Download className="size-3 text-blue-500" /> Downloaded:
                                </span>
                                <strong className="text-slate-800 font-semibold">{fmtBytes(traffic?.download || 0)}</strong>
                            </div>
                            <div className="border-t pt-2 flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700">Total Usage:</span>
                                <strong className="text-indigo-600 font-bold">{fmtBytes(traffic?.total || 0)}</strong>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Billing Transactions */}
                <div className="border rounded-xl shadow-sm bg-white overflow-hidden mt-4">
                    <div className="bg-slate-50 px-4 py-3 border-b">
                        <h4 className="font-bold text-slate-800 text-sm">Recent Recharge Transactions</h4>
                    </div>
                    <div className="p-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Recharge Date</TableHead>
                                    <TableHead>Expiration Date</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-4">
                                            No transaction records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((t) => (
                                        <TableRow key={t.invoice}>
                                            <TableCell className="font-mono font-medium text-indigo-600 text-xs">
                                                {t.invoice}
                                            </TableCell>
                                            <TableCell>{t.plan_name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{t.type}</Badge>
                                            </TableCell>
                                            <TableCell>{t.recharged_on}</TableCell>
                                            <TableCell>{t.expiration}</TableCell>
                                            <TableCell className="text-right font-semibold text-slate-800">
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
        </CustomerLayout>
    );
}
