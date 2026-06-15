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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { type Customer, type Recharge, type Transaction } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{value || '—'}</dd>
        </div>
    );
}

export default function CustomersShow({
    customer,
    recharges,
    transactions,
}: {
    customer: Customer;
    recharges: Recharge[];
    transactions: Transaction[];
}) {
    const destroy = () => {
        if (confirm(`Delete customer "${customer.username}"? This cannot be undone.`)) {
            router.delete(route('customers.destroy', customer.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Customer: {customer.username}
                </h2>
            }
        >
            <Head title={customer.username ?? 'Customer'} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <Button asChild variant="ghost">
                            <Link href={route('customers.index')}>
                                <ArrowLeft className="mr-1 size-4" /> Back
                            </Link>
                        </Button>
                        <div className="flex gap-2">
                            <Button asChild variant="secondary">
                                <Link href={route('customers.edit', customer.id)}>
                                    <Pencil className="mr-1 size-4" /> Edit
                                </Link>
                            </Button>
                            <Button variant="destructive" onClick={destroy}>
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
                                    value={customer.last_login_at}
                                />
                                <Field label="Joined" value={customer.created_at} />
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
                                            <TableCell>{r.expiration}</TableCell>
                                            <TableCell>{r.method}</TableCell>
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
            </div>
        </AuthenticatedLayout>
    );
}
