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
import api from '@/lib/api';
import { useSearchParams } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

const fmt = new Intl.NumberFormat();

interface ReportsResponse {
    transactions: Paginator<Transaction>;
    summary: {
        total: number;
        count: number;
        from: string;
        to: string;
    };
}

export default function ReportsIndex() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const username = searchParams.get('username') || '';

    // Local filter state for inputs
    const [fromInput, setFromInput] = useState(from);
    const [toInput, setToInput] = useState(to);
    const [userInput, setUserInput] = useState(username);

    // Fetch reports
    const { data: reportsData, isLoading, isError } = useQuery<ReportsResponse>({
        queryKey: ['reports', page, from, to, username],
        queryFn: async () => {
            const res = await api.get('/reports', {
                params: {
                    page,
                    from: from || undefined,
                    to: to || undefined,
                    username: username || undefined,
                },
            });
            return res.data;
        },
        placeholderData: keepPreviousData,
    });

    // Synchronize local states when URL parameters change
    useEffect(() => {
        if (reportsData?.summary) {
            setFromInput(from || reportsData.summary.from);
            setToInput(to || reportsData.summary.to);
        }
    }, [from, to, reportsData]);

    useEffect(() => {
        setUserInput(username);
    }, [username]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setSearchParams({
            from: fromInput,
            to: toInput,
            username: userInput,
            page: '1',
        });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({
            from,
            to,
            username,
            page: String(newPage),
        });
    };

    const summary = reportsData?.summary || { total: 0, count: 0, from: '—', to: '—' };
    const transactions = reportsData?.transactions;

    return (
        <AppLayout title="Reports">
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
                                    value={fromInput}
                                    onChange={(e) => setFromInput(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="to">To</Label>
                                <Input
                                    id="to"
                                    type="date"
                                    value={toInput}
                                    onChange={(e) => setToInput(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="cursor-pointer">Apply</Button>
                        </form>

                        {isLoading ? (
                            <div className="flex h-48 items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : isError || !transactions ? (
                            <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive text-center">
                                Failed to load report transactions.
                            </div>
                        ) : (
                            <>
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
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
