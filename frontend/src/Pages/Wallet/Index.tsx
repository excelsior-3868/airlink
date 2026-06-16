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
import api from '@/lib/api';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface WalletRow {
    id: number;
    username: string;
    user_type: string | null;
    credit_balance: number;
    available_balance: number | null;
    last_loaded_date: string | null;
    loaded_by: string | null;
}

interface WalletResponse {
    wallets: Paginator<WalletRow>;
    company: {
        id: number;
        account_balance: number | null;
        balance_to_collect: number | null;
        created_at: string | null;
        updated_at: string | null;
    } | null;
}

const fmt = new Intl.NumberFormat();

export default function WalletIndex() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Form fields state
    const [username, setUsername] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [userType, setUserType] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch wallets and company wallet balance
    const { data: walletData, isLoading, isError } = useQuery<WalletResponse>({
        queryKey: ['wallet', page],
        queryFn: async () => {
            const res = await api.get('/wallet', {
                params: { page },
            });
            return res.data;
        },
        placeholderData: keepPreviousData,
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            return await api.post('/wallet/load', payload);
        },
        onSuccess: (res) => {
            toast.success(res.data.message || 'Credit loaded successfully.');
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            // Reset form fields
            setUsername('');
            setAmount(0);
            setUserType('');
        },
        onError: (err: any) => {
            if (err.response?.status === 422) {
                const apiErrors = err.response.data.errors || {};
                const mappedErrors: Record<string, string> = {};
                Object.keys(apiErrors).forEach((key) => {
                    mappedErrors[key] = apiErrors[key][0];
                });
                setErrors(mappedErrors);
            } else {
                toast.error(err.response?.data?.message || 'Failed to load credit.');
            }
        },
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setErrors({});
        mutation.mutate({
            username,
            amount,
            user_type: userType || null,
        });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: String(newPage) });
    };

    const company = walletData?.company || null;
    const wallets = walletData?.wallets;

    return (
        <AppLayout title="Wallet">
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
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <InputError message={errors.username} />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount || ''}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                />
                                <InputError message={errors.amount} />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="user_type">User type</Label>
                                <Input
                                    id="user_type"
                                    placeholder="Sales / POS"
                                    value={userType}
                                    onChange={(e) => setUserType(e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={mutation.isPending} className="cursor-pointer">
                                Load
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        {isLoading ? (
                            <div className="flex h-48 items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : isError || !wallets ? (
                            <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive text-center">
                                Failed to load wallets.
                            </div>
                        ) : (
                            <>
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
                                                <TableCell>{w.user_type || '—'}</TableCell>
                                                <TableCell className="text-right">
                                                    {fmt.format(w.credit_balance)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {fmt.format(w.available_balance ?? 0)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {w.last_loaded_date || '—'}
                                                </TableCell>
                                                <TableCell>{w.loaded_by || '—'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Pagination
                                    links={wallets.links}
                                    from={wallets.from}
                                    to={wallets.to}
                                    total={wallets.total}
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
