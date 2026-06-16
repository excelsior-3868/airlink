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
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { FormEventHandler, ReactNode, useState, useEffect } from 'react';

export interface Column<T> {
    header: string;
    cell: (row: T, index: number) => ReactNode;
    className?: string;
}

interface CrudIndexProps<T extends { id: number }> {
    rows?: Paginator<T>;
    columns: Column<T>[];
    routeBase: string; // e.g. 'bandwidth', 'plans'
    createLabel: string;
    searchPlaceholder?: string;
    deleteName: (row: T) => string;
    isLoading?: boolean;
    isError?: boolean;
    onSearch: (search: string) => void;
    onDelete: (row: T) => void;
    onPageChange: (page: number) => void;
    initialSearch?: string;
}

export default function CrudIndex<T extends { id: number }>({
    rows,
    columns,
    routeBase,
    createLabel,
    searchPlaceholder = 'Search by name…',
    deleteName,
    isLoading = false,
    isError = false,
    onSearch,
    onDelete,
    onPageChange,
    initialSearch = '',
}: CrudIndexProps<T>) {
    const [search, setSearch] = useState(initialSearch);

    useEffect(() => {
        setSearch(initialSearch);
    }, [initialSearch]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        onSearch(search);
    };

    const handleDeleteClick = (row: T) => {
        if (confirm(`Delete "${deleteName(row)}"? This cannot be undone.`)) {
            onDelete(row);
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
                    <Button type="submit" variant="secondary" className="cursor-pointer">
                        <Search className="size-4" />
                    </Button>
                </form>
                <Button asChild className="cursor-pointer">
                    <Link to={`/${routeBase}/create`}>
                        <Plus className="mr-1 size-4" /> {createLabel}
                    </Link>
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex h-48 items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : isError || !rows ? (
                        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive text-center">
                            Failed to load records.
                        </div>
                    ) : (
                        <>
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
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button asChild size="icon" variant="ghost" className="cursor-pointer">
                                                        <Link to={`/${routeBase}/${row.id}/edit`}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="cursor-pointer"
                                                        onClick={() => handleDeleteClick(row)}
                                                    >
                                                        <Trash2 className="size-4 text-destructive" />
                                                    </Button>
                                                </div>
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
                                onPageChange={onPageChange}
                            />
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
