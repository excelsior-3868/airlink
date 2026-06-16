import Pagination, { type Paginator } from '@/components/Pagination';
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
    routeBase: string; // e.g. 'bandwidth', 'plans'
    indexRoute: string; // route name e.g. 'bandwidth.index'
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
            <div className="flex items-center justify-between gap-4">
                <form onSubmit={submit} className="flex flex-1 gap-2">
                    <Input
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit" variant="secondary">
                        <Search className="size-4" />
                    </Button>
                </form>
                <Button asChild>
                    <Link href={route(`${routeBase}.create`)}>
                        <Plus className="mr-1 size-4" /> {createLabel}
                    </Link>
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">S.N.</TableHead>
                                {columns.map((c) => (
                                    <TableHead key={c.header} className={c.className}>
                                        {c.header}
                                    </TableHead>
                                ))}
                                <TableHead className="text-right">Manage</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length + 2}
                                        className="text-center text-muted-foreground"
                                    >
                                        Nothing found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {rows.data.map((row, i) => (
                                <TableRow key={row.id}>
                                    <TableCell className="text-muted-foreground">
                                        {(rows.from ?? 0) + i}
                                    </TableCell>
                                    {columns.map((c) => (
                                        <TableCell key={c.header} className={c.className}>
                                            {c.cell(row, i)}
                                        </TableCell>
                                    ))}
                                    <TableCell className="flex justify-end gap-1">
                                        <Button asChild size="icon" variant="ghost">
                                            <Link href={route(`${routeBase}.edit`, row.id)}>
                                                <Pencil className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => destroy(row)}
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination
                        links={rows.links}
                        from={rows.from}
                        to={rows.to}
                        total={rows.total}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
