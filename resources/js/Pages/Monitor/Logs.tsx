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
import { Head, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Log {
    id: number;
    username: string;
    reply: string;
    authdate: string | null;
}

export default function MonitorLogs({
    logs,
    filters,
}: {
    logs: Paginator<Log>;
    filters: { search?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('monitor.logs'), { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Auth Logs">
            <Head title="Auth Logs" />
            <div className="mx-auto max-w-5xl space-y-5">
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="mb-4 flex gap-2">
                            <Input
                                placeholder="Search username…"
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
                                    <TableHead>Username</TableHead>
                                    <TableHead>Result</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            No auth records.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {logs.data.map((l) => (
                                    <TableRow key={l.id}>
                                        <TableCell className="font-medium">{l.username}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    l.reply === 'Access-Accept'
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                            >
                                                {l.reply}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {l.authdate}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Pagination links={logs.links} from={logs.from} to={logs.to} total={logs.total} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
