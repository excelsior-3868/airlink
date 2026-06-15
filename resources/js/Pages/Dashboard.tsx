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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
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

export default function Dashboard({
    stats,
    recentTransactions,
}: {
    stats: Stats;
    recentTransactions: Transaction[];
}) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
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
                        <StatCard
                            title="Revenue (Month)"
                            value={fmt.format(stats.revenueMonth)}
                            icon={Receipt}
                            hint={`${fmt.format(stats.revenueToday)} today`}
                        />
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
                                        <TableHead className="text-right">
                                            Price
                                        </TableHead>
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
                                            <TableCell className="font-mono text-xs">
                                                {t.invoice}
                                            </TableCell>
                                            <TableCell>{t.username}</TableCell>
                                            <TableCell>{t.plan_name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {t.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {t.price}
                                            </TableCell>
                                            <TableCell>
                                                {t.recharged_on}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
