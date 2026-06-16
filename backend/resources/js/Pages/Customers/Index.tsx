import Pagination, { type Paginator } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import { type Customer } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

// Legacy "Manage Contact" action buttons, matched to the original colours.
const ACTION_BTN =
    'inline-flex items-center gap-1.5 rounded px-3 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50';

export default function CustomersIndex({
    customers,
    filters,
}: {
    customers: Paginator<Customer>;
    filters: { search?: string; id?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selected, setSelected] = useState<number[]>([]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(
            route('customers.index'),
            { search },
            { preserveState: true, replace: true },
        );
    };

    const searchById = () => {
        router.get(
            route('customers.index'),
            { id: search },
            { preserveState: true, replace: true },
        );
    };

    const toggle = (id: number) =>
        setSelected((s) =>
            s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
        );

    const toggleAll = () =>
        setSelected(
            selected.length === customers.data.length
                ? []
                : customers.data.map((c) => c.id),
        );

    const bulk = (action: 'activate' | 'deactivate' | 'disable') => {
        if (selected.length === 0) {
            toast.error('Select at least one customer first.');
            return;
        }
        router.post(
            route('customers.bulk-action'),
            { action, ids: selected },
            { preserveScroll: true, onSuccess: () => setSelected([]) },
        );
    };

    const notYet = (label: string) =>
        toast.info(`${label} will be available once that module is built.`);

    return (
        <AppLayout title="Manage Customers">
            <Head title="Customers" />

            <div className="mx-auto max-w-7xl space-y-5">
                {/* Action bar — mirrors legacy Manage Contact */}
                <div className="flex flex-wrap gap-2">
                    <Link
                        href={route('customers.create')}
                        className={cn(ACTION_BTN, 'bg-[#13366e] hover:bg-[#0f2a57]')}
                    >
                        <Plus className="size-4" /> Add New
                    </Link>
                    <button
                        onClick={() => notYet('Change Password')}
                        className={cn(ACTION_BTN, 'bg-[#2f6fb0] hover:bg-[#285f99]')}
                    >
                        <Plus className="size-4" /> Change Password
                    </button>
                    <button
                        onClick={() => bulk('disable')}
                        className={cn(ACTION_BTN, 'bg-[#e23b3b] hover:bg-[#c93030]')}
                    >
                        <Plus className="size-4" /> Disable
                    </button>
                    <button
                        onClick={() => bulk('activate')}
                        className={cn(ACTION_BTN, 'bg-[#1aa3b8] hover:bg-[#158ca0]')}
                    >
                        <Plus className="size-4" /> Activate
                    </button>
                    <button
                        onClick={() => bulk('deactivate')}
                        className={cn(ACTION_BTN, 'bg-[#e23b3b] hover:bg-[#c93030]')}
                    >
                        <Plus className="size-4" /> Deactivate
                    </button>
                    <button
                        onClick={() => {
                            if (selected.length !== 1) {
                                toast.error('Select exactly one customer to recharge.');
                                return;
                            }
                            router.visit(route('recharge.create', selected[0]));
                        }}
                        className={cn(ACTION_BTN, 'bg-[#2f6fb0] hover:bg-[#285f99]')}
                    >
                        <Plus className="size-4" /> Recharge
                    </button>
                    <button
                        onClick={() => notYet('Change MAC')}
                        className={cn(ACTION_BTN, 'bg-[#2e9e3f] hover:bg-[#268435]')}
                    >
                        <Plus className="size-4" /> Change MAC
                    </button>
                </div>

                {/* Search bar — Search + Search By ID */}
                <form onSubmit={submit} className="flex flex-wrap items-stretch gap-2">
                    <span className="flex items-center rounded bg-[#13366e] px-3 text-white">
                        <Search className="size-4" />
                    </span>
                    <Input
                        placeholder="Search by Username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-md flex-1"
                    />
                    <Button type="submit" className="bg-[#13366e] hover:bg-[#0f2a57]">
                        Search
                    </Button>
                    <Button
                        type="button"
                        onClick={searchById}
                        className="bg-[#2f6fb0] hover:bg-[#285f99]"
                    >
                        Search By ID
                    </Button>
                </form>

                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">
                                        <input
                                            type="checkbox"
                                            className="size-4 rounded border-input"
                                            checked={
                                                customers.data.length > 0 &&
                                                selected.length ===
                                                    customers.data.length
                                            }
                                            onChange={toggleAll}
                                        />
                                    </TableHead>
                                    <TableHead className="w-12">S.N.</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Profile</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Created_date</TableHead>
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
                                            colSpan={8}
                                            className="text-center text-muted-foreground"
                                        >
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {customers.data.map((c, i) => (
                                    <TableRow key={c.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                className="size-4 rounded border-input"
                                                checked={selected.includes(c.id)}
                                                onChange={() => toggle(c.id)}
                                            />
                                        </TableCell>
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
                                        <TableCell>{c.generated_by}</TableCell>
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
        </AppLayout>
    );
}
