import Pagination, { type Paginator } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { FormEventHandler, ReactNode, useState } from 'react';

export interface Column<T> {
    header: string;
    cell: (row: T, index: number) => ReactNode;
    className?: string;
}

interface CrudIndexProps<T extends { id: number }> {
    rows: Paginator<T>;
    columns: Column<T>[];
    routeBase: string;
    indexRoute: string;
    createLabel: string;
    search?: string;
    searchPlaceholder?: string;
    deleteName: (row: T) => string;
}

export default function CrudIndex<T extends { id: number }>({
    rows,
    columns,
    routeBase,
    indexRoute,
    createLabel,
    search: initialSearch,
    searchPlaceholder = 'Search by name…',
    deleteName,
}: CrudIndexProps<T>) {
    const [search, setSearch] = useState(initialSearch ?? '');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route(indexRoute), { search }, { preserveState: true, replace: true });
    };

    const destroy = (row: T) => {
        if (confirm(`Delete "${deleteName(row)}"? This cannot be undone.`)) {
            router.delete(route(`${routeBase}.destroy`, row.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-5">
            {/* ── Toolbar ──────────────────────────────── */}
            <div className="flex items-center justify-between gap-4">
                <form onSubmit={submit} className="flex flex-1 gap-2">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit" variant="secondary" size="default">
                        Search
                    </Button>
                </form>
                <Button asChild>
                    <Link href={route(`${routeBase}.create`)}>
                        <Plus className="mr-1.5 size-4" />
                        {createLabel}
                    </Link>
                </Button>
            </div>

            {/* ── Table card ───────────────────────────── */}
            <Card className="border-0 shadow-sm ring-1 ring-border/60">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="nt-table w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left w-12">S.N.</th>
                                    {columns.map((c) => (
                                        <th key={c.header} className={`px-4 py-3 text-left ${c.className ?? ''}`}>
                                            {c.header}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-right">Manage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={columns.length + 2}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            Nothing found.
                                        </td>
                                    </tr>
                                )}
                                {rows.data.map((row, i) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-muted-foreground text-xs">
                                            {(rows.from ?? 0) + i}
                                        </td>
                                        {columns.map((c) => (
                                            <td key={c.header} className={`px-4 py-3 ${c.className ?? ''}`}>
                                                {c.cell(row, i)}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button asChild size="icon" variant="ghost" className="size-8 hover:bg-primary/10 hover:text-primary">
                                                    <Link href={route(`${routeBase}.edit`, row.id)}>
                                                        <Pencil className="size-3.5" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-8 hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => destroy(row)}
                                                >
                                                    <Trash2 className="size-3.5" />
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
                            links={rows.links}
                            from={rows.from}
                            to={rows.to}
                            total={rows.total}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
