import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/Layouts/AppLayout';
import { type Customer, type Recharge, type Transaction } from '@/types/models';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                {label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{value || '—'}</dd>
        </div>
    );
}

export default function CustomersShow() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery<{
        customer: Customer;
        history: {
            recharges: Recharge[];
            transactions: Transaction[];
        };
    }>({
        queryKey: ['customer-detail', id],
        queryFn: async () => {
            const res = await api.get(`/customers/${id}`);
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const res = await api.delete(`/customers/${id}`);
            return res.data;
        },
        onSuccess: (res) => {
            toast.success(res.message || 'Customer deleted successfully.');
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            navigate('/customers');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete customer.');
        },
    });

    const destroy = () => {
        if (!data?.customer) return;
        if (confirm(`Delete customer "${data.customer.username}"? This cannot be undone.`)) {
            deleteMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <AppLayout title="Customer Details">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    if (isError || !data?.customer) {
        return (
            <AppLayout title="Customer Details">
                <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive text-center">
                    Failed to load customer details.
                </div>
            </AppLayout>
        );
    }

    const { customer } = data;
    const recharges = data.history?.recharges || [];
    const transactions = data.history?.transactions || [];

    return (
        <AppLayout title={`Customer: ${customer.username}`}>
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex items-center justify-between">
                    <Button asChild variant="ghost">
                        <Link to="/customers">
                            <ArrowLeft className="mr-1 size-4" /> Back
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button asChild variant="secondary">
                            <Link to={`/customers/${customer.id}/edit`}>
                                <Pencil className="mr-1 size-4" /> Edit
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={destroy}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash2 className="mr-1 size-4" /> Delete
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <Field label="Full name" value={customer.fullname} />
                            <Field label="Phone" value={customer.phonenumber} />
                            <Field label="Type" value={customer.type} />
                            <Field
                                label="Status"
                                value={
                                    <Badge
                                        variant={
                                            customer.status === 'activate'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {customer.status}
                                    </Badge>
                                }
                            />
                            <Field label="Profile" value={customer.profile} />
                            <Field label="Address" value={customer.address} />
                            <Field
                                label="Last login"
                                value={
                                    customer.last_login_at
                                        ? customer.last_login_at.replace('T', ' ').slice(0, 19)
                                        : '—'
                                }
                            />
                            <Field
                                label="Joined"
                                value={
                                    customer.created_at
                                        ? customer.created_at.replace('T', ' ').slice(0, 19)
                                        : '—'
                                }
                            />
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recharge History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Recharged</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recharges.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground"
                                        >
                                            No recharges.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {recharges.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>{r.plan_name}</TableCell>
                                        <TableCell>
                                            {r.recharged_on}
                                        </TableCell>
                                        <TableCell>{r.expiration || '—'}</TableCell>
                                        <TableCell>{r.method || '—'}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    r.status === 'on'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {r.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Billing History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead className="text-right">
                                        Price
                                    </TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center text-muted-foreground"
                                        >
                                            No transactions.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {transactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-mono text-xs">
                                            {t.invoice}
                                        </TableCell>
                                        <TableCell>{t.plan_name}</TableCell>
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
        </AppLayout>
    );
}
