import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/Layouts/AppLayout';
import api from '@/lib/api';
import { Receipt, Ticket, Users, Wifi } from 'lucide-react';

interface Stats {
    customers: number;
    activeCustomers: number;
    plans: number;
    vouchersUnused: number;
    activeRecharges: number;
    revenueToday: number;
    revenueMonth: number;
}

interface Transaction {
    invoice: string;
    username: string;
    plan_name: string;
    price: string;
    recharged_on: string;
    type: string;
}

const fmt = new Intl.NumberFormat();

function StatCard({
    title,
    value,
    icon: Icon,
    hint,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    hint?: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {hint && (
                    <p className="text-xs text-muted-foreground">{hint}</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/dashboard')
            .then((res) => {
                setStats(res.data.stats);
                setRecentTransactions(res.data.recentTransactions);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to load dashboard data.');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <AppLayout title="Dashboard">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    if (error || !stats) {
        return (
            <AppLayout title="Dashboard">
                <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
                    {error || 'An unexpected error occurred.'}
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Dashboard">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Customers"
                        value={fmt.format(stats.customers)}
                        icon={Users}
                        hint={`${fmt.format(stats.activeCustomers)} active`}
                    />
                    <StatCard
                        title="Active Sessions"
                        value={fmt.format(stats.activeRecharges)}
                        icon={Wifi}
                        hint="recharges currently on"
                    />
                    <StatCard
                        title="Unused Vouchers"
                        value={fmt.format(stats.vouchersUnused)}
                        icon={Ticket}
                        hint={`${fmt.format(stats.plans)} plans`}
                    />
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Revenue (Month)
                            </CardTitle>
                            <Receipt className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">NPR {fmt.format(stats.revenueMonth)}</div>
                            <p className="text-xs text-muted-foreground">NPR {fmt.format(stats.revenueToday)} today</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactions.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground"
                                        >
                                            No transactions yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {recentTransactions.map((t) => (
                                    <TableRow key={t.invoice}>
                                        <TableCell className="font-mono text-xs">{t.invoice}</TableCell>
                                        <TableCell>{t.username}</TableCell>
                                        <TableCell>{t.plan_name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{t.type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{t.price}</TableCell>
                                        <TableCell>{t.recharged_on}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
