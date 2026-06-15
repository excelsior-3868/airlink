import Pagination, { type Paginator } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { type Customer } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function CustomersIndex({
    customers,
    filters,
}: {
    customers: Paginator<Customer>;
    filters: { search?: string; status?: string; type?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(
            route('customers.index'),
            { search },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Customers
                </h2>
            }
        >
            <Head title="Customers" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <CardTitle>All Customers</CardTitle>
                            <Button asChild>
                                <Link href={route('customers.create')}>
                                    <Plus className="mr-1 size-4" /> New Customer
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="mb-4 flex gap-2">
                                <Input
                                    placeholder="Search username, name, or phone…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="max-w-sm"
                                />
                                <Button type="submit" variant="secondary">
                                    Search
                                </Button>
                            </form>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">S.N.</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Profile</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Created date</TableHead>
                                        <TableHead>POS Owner</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.data.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="text-center text-muted-foreground"
                                            >
                                                No customers found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {customers.data.map((c, i) => (
                                        <TableRow key={c.id}>
                                            <TableCell className="text-muted-foreground">
                                                {(customers.from ?? 0) + i}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {c.username}
                                            </TableCell>
                                            <TableCell>{c.profile}</TableCell>
                                            <TableCell>
                                                {c.batch && (
                                                    <Badge variant="outline">
                                                        {c.batch}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                {c.created_at
                                                    ?.replace('T', ' ')
                                                    .slice(0, 19)}
                                            </TableCell>
                                            <TableCell>
                                                {c.generated_by}
                                            </TableCell>
                                            <TableCell className="flex justify-end gap-1">
                                                <Button
                                                    asChild
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Link
                                                        href={route(
                                                            'customers.show',
                                                            c.id,
                                                        )}
                                                    >
                                                        <Eye className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Link
                                                        href={route(
                                                            'customers.edit',
                                                            c.id,
                                                        )}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <Pagination
                                links={customers.links}
                                from={customers.from}
                                to={customers.to}
                                total={customers.total}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
