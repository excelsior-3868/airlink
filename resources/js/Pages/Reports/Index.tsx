import Pagination, { type Paginator } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/Layouts/AppLayout';
import { type Transaction } from '@/types/models';
import { Head, router } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const fmt = new Intl.NumberFormat();

export default function ReportsIndex({
    transactions,
    summary,
    filters,
}: {
    transactions: Paginator<Transaction>;
    summary: { total: number; count: number; from: string; to: string };
    filters: { from: string; to: string; type?: string; username?: string };
}) {
    const [f, setF] = useState(filters);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('reports.index'), f, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Reports">
            <Head title="Reports" />
            <div className="mx-auto max-w-7xl space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Revenue ({summary.from} → {summary.to})
                            </CardTitle>
                            <Receipt className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{fmt.format(summary.total)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{fmt.format(summary.count)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="mb-4 flex flex-wrap items-end gap-3">
                            <div className="grid gap-1">
                                <Label htmlFor="from">From</Label>
                                <Input
                                    id="from"
                                    type="date"
                                    value={f.from}
                                    onChange={(e) => setF({ ...f, from: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="to">To</Label>
                                <Input
                                    id="to"
                                    type="date"
                                    value={f.to}
                                    onChange={(e) => setF({ ...f, to: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={f.username ?? ''}
                                    onChange={(e) => setF({ ...f, username: e.target.value })}
                                />
                            </div>
                            <Button type="submit">Apply</Button>
                        </form>

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
                                {transactions.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No transactions in this range.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {transactions.data.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-mono text-xs">{t.invoice}</TableCell>
                                        <TableCell>{t.username}</TableCell>
                                        <TableCell>{t.plan_name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{t.type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{t.price}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {t.recharged_on}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Pagination
                            links={transactions.links}
                            from={transactions.from}
                            to={transactions.to}
                            total={transactions.total}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
