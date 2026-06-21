import Pagination, { type Paginator } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/Layouts/AppLayout';
import { type Customer } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import {
    Eye,
    Pencil,
    Plus,
    Power,
    PowerOff,
    RefreshCw,
    Search,
    ShieldOff,
    SmartphoneNfc,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

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

                {/* ── Action toolbar ───────────────────────── */}
                <div className="flex flex-wrap items-center gap-2">
                    <Button asChild size="sm">
                        <Link href={route('customers.create')}>
                            <Plus className="mr-1.5 size-3.5" /> Add New
                        </Link>
                    </Button>

                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => notYet('Change Password')}
                    >
                        <ShieldOff className="mr-1.5 size-3.5" /> Change Password
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => bulk('disable')}
                    >
                        <PowerOff className="mr-1.5 size-3.5" /> Disable
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-400/50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => bulk('activate')}
                    >
                        <Power className="mr-1.5 size-3.5" /> Activate
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => bulk('deactivate')}
                    >
                        <PowerOff className="mr-1.5 size-3.5" /> Deactivate
                    </Button>

                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            if (selected.length !== 1) {
                                toast.error('Select exactly one customer to recharge.');
                                return;
                            }
                            router.visit(route('recharge.create', selected[0]));
                        }}
                    >
                        <RefreshCw className="mr-1.5 size-3.5" /> Recharge
                    </Button>

                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => notYet('Change MAC')}
                    >
                        <SmartphoneNfc className="mr-1.5 size-3.5" /> Change MAC
                    </Button>
                </div>

                {/* ── Search bar ───────────────────────────── */}
                <form onSubmit={submit} className="flex flex-wrap items-stretch gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit" size="default">
                        Search
                    </Button>
                    <Button
                        type="button"
                        size="default"
                        variant="secondary"
                        onClick={searchById}
                    >
                        Search By ID
                    </Button>
                </form>

                {/* ── Table ────────────────────────────────── */}
                <Card className="border-0 shadow-sm ring-1 ring-border/60">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="nt-table w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 w-10">
                                            <input
                                                type="checkbox"
                                                className="size-4 rounded border-white/40 cursor-pointer"
                                                checked={
                                                    customers.data.length > 0 &&
                                                    selected.length === customers.data.length
                                                }
                                                onChange={toggleAll}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left w-12">S.N.</th>
                                        <th className="px-4 py-3 text-left">Username</th>
                                        <th className="px-4 py-3 text-left">Profile</th>
                                        <th className="px-4 py-3 text-left">Batch</th>
                                        <th className="px-4 py-3 text-left">Created Date</th>
                                        <th className="px-4 py-3 text-left">POS Owner</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-4 py-10 text-center text-muted-foreground"
                                            >
                                                No customers found.
                                            </td>
                                        </tr>
                                    )}
                                    {customers.data.map((c, i) => (
                                        <tr
                                            key={c.id}
                                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    className="size-4 rounded border-input cursor-pointer"
                                                    checked={selected.includes(c.id)}
                                                    onChange={() => toggle(c.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {(customers.from ?? 0) + i}
                                            </td>
                                            <td className="px-4 py-3 font-medium">{c.username}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{c.profile}</td>
                                            <td className="px-4 py-3">
                                                {c.batch && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {c.batch}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                                                {c.created_at?.replace('T', ' ').slice(0, 19)}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{c.generated_by}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        asChild
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8 hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        <Link href={route('customers.show', c.id)}>
                                                            <Eye className="size-3.5" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8 hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        <Link href={route('customers.edit', c.id)}>
                                                            <Pencil className="size-3.5" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 py-3 border-t border-border/50">
                            <Pagination
                                links={customers.links}
                                from={customers.from}
                                to={customers.to}
                                total={customers.total}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
