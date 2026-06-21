import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { Receipt, Ticket, TrendingUp, Users, Wallet, Wifi } from 'lucide-react';

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

interface StatCardProps {
    title: string;
    value: string | number;
    hint?: string;
    icon: React.ElementType;
    accent: string;        // bg class for icon bubble
    iconColor: string;     // text class for icon
    trend?: string;
}

function StatCard({ title, value, hint, icon: Icon, accent, iconColor, trend }: StatCardProps) {
    return (
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60 transition-shadow hover:shadow-md">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {title}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
                        {hint && (
                            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                        )}
                        {trend && (
                            <div className="mt-2 flex items-center gap-1 text-emerald-600">
                                <TrendingUp className="size-3" />
                                <span className="text-[11px] font-medium">{trend}</span>
                            </div>
                        )}
                    </div>
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                        <Icon className={`size-5 ${iconColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const TYPE_BADGE: Record<string, string> = {
    new:    'bg-blue-100 text-blue-700 border-blue-200',
    renew:  'bg-emerald-100 text-emerald-700 border-emerald-200',
    top:    'bg-amber-100 text-amber-700 border-amber-200',
};

export default function Dashboard({
    stats,
    recentTransactions,
}: {
    stats: Stats;
    recentTransactions: Transaction[];
}) {
    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl space-y-6">

                {/* ── Stat cards ──────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Customers"
                        value={fmt.format(stats.customers)}
                        hint={`${fmt.format(stats.activeCustomers)} active`}
                        icon={Users}
                        accent="bg-blue-100"
                        iconColor="text-blue-600"
                    />
                    <StatCard
                        title="Active Sessions"
                        value={fmt.format(stats.activeRecharges)}
                        hint="currently online"
                        icon={Wifi}
                        accent="bg-emerald-100"
                        iconColor="text-emerald-600"
                    />
                    <StatCard
                        title="Unused Vouchers"
                        value={fmt.format(stats.vouchersUnused)}
                        hint={`${fmt.format(stats.plans)} plans total`}
                        icon={Ticket}
                        accent="bg-amber-100"
                        iconColor="text-amber-600"
                    />
                    <StatCard
                        title="Monthly Revenue"
                        value={`Rs. ${fmt.format(stats.revenueMonth)}`}
                        hint={`Rs. ${fmt.format(stats.revenueToday)} today`}
                        icon={Receipt}
                        accent="bg-violet-100"
                        iconColor="text-violet-600"
                        trend="Revenue tracking active"
                    />
                </div>

                {/* ── Quick stats strip ──────────────────── */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border-0 shadow-sm ring-1 ring-border/60">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50">
                                <Wallet className="size-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Today's Revenue</p>
                                <p className="font-bold text-foreground">Rs. {fmt.format(stats.revenueToday)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm ring-1 ring-border/60">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50">
                                <Users className="size-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Active Customers</p>
                                <p className="font-bold text-foreground">{fmt.format(stats.activeCustomers)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm ring-1 ring-border/60">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-violet-50">
                                <Receipt className="size-4 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Plans</p>
                                <p className="font-bold text-foreground">{fmt.format(stats.plans)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Recent transactions ────────────────── */}
                <Card className="border-0 shadow-sm ring-1 ring-border/60">
                    <CardHeader className="border-b border-border/60 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
                            <Badge variant="secondary" className="text-xs">Live</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="nt-table w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left">Invoice</th>
                                        <th className="px-6 py-3 text-left">Username</th>
                                        <th className="px-6 py-3 text-left">Plan</th>
                                        <th className="px-6 py-3 text-left">Type</th>
                                        <th className="px-6 py-3 text-right">Price</th>
                                        <th className="px-6 py-3 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                                                No transactions yet.
                                            </td>
                                        </tr>
                                    )}
                                    {recentTransactions.map((t) => {
                                        const badgeClass = TYPE_BADGE[t.type?.toLowerCase()] ?? 'bg-slate-100 text-slate-600 border-slate-200';
                                        return (
                                            <tr key={t.invoice} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                                                    {t.invoice}
                                                </td>
                                                <td className="px-6 py-3 font-medium">{t.username}</td>
                                                <td className="px-6 py-3 text-muted-foreground">{t.plan_name}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${badgeClass}`}>
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right font-semibold">{t.price}</td>
                                                <td className="px-6 py-3 text-xs text-muted-foreground whitespace-nowrap">{t.recharged_on}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
