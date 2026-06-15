import InputError from '@/components/InputError';
import Pagination, { type Paginator } from '@/components/Pagination';
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
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface WalletRow {
    id: number;
    username: string;
    user_type: string | null;
    credit_balance: number;
    available_balance: number | null;
    last_loaded_date: string | null;
    loaded_by: string | null;
}

const fmt = new Intl.NumberFormat();

export default function WalletIndex({
    wallets,
    company,
}: {
    wallets: Paginator<WalletRow>;
    company: { account_balance: number | null; balance_to_collect: number | null } | null;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        amount: 0,
        user_type: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('wallet.load'), { onSuccess: () => reset() });
    };

    return (
        <AppLayout title="Wallet">
            <Head title="Wallet" />
            <div className="mx-auto max-w-7xl space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Company Balance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {fmt.format(company?.account_balance ?? 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                To collect: {fmt.format(company?.balance_to_collect ?? 0)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Load Credit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
                            <div className="grid gap-1">
                                <Label htmlFor="username">Seller / POS username</Label>
                                <Input
                                    id="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                />
                                <InputError message={errors.username} />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', Number(e.target.value))}
                                />
                                <InputError message={errors.amount} />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="user_type">User type</Label>
                                <Input
                                    id="user_type"
                                    placeholder="Sales / POS"
                                    value={data.user_type}
                                    onChange={(e) => setData('user_type', e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={processing}>
                                Load
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                    <TableHead className="text-right">Available</TableHead>
                                    <TableHead>Last loaded</TableHead>
                                    <TableHead>Loaded by</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {wallets.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No wallets yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {wallets.data.map((w) => (
                                    <TableRow key={w.id}>
                                        <TableCell className="font-medium">{w.username}</TableCell>
                                        <TableCell>{w.user_type}</TableCell>
                                        <TableCell className="text-right">
                                            {fmt.format(w.credit_balance)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {fmt.format(w.available_balance ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {w.last_loaded_date}
                                        </TableCell>
                                        <TableCell>{w.loaded_by}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Pagination
                            links={wallets.links}
                            from={wallets.from}
                            to={wallets.to}
                            total={wallets.total}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
