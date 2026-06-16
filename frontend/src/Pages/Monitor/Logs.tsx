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
import { useState, useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';

interface Log {
    id: number;
    username: string;
    reply: string;
    authdate: string | null;
}

interface LogsResponse {
    logs: Paginator<Log>;
}

export default function MonitorLogs() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';

    const [searchInput, setSearchInput] = useState(search);

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    const { data: logsData, isLoading, isError } = useQuery<LogsResponse>({
        queryKey: ['monitorLogs', page, search],
        queryFn: async () => {
            const res = await api.get('/monitor/logs', {
                params: {
                    page,
                    search: search || undefined,
                },
            });
            return res.data;
        },
        placeholderData: keepPreviousData,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setSearchParams({ search: searchInput, page: '1' });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ search, page: String(newPage) });
    };

    const logs = logsData?.logs;

    return (
        <AppLayout title="Auth Logs">
            <div className="mx-auto max-w-5xl space-y-5">
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="mb-4 flex gap-2">
                            <Input
                                placeholder="Search username…"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="max-w-sm"
                            />
                            <Button type="submit" variant="secondary" className="cursor-pointer">
                                Search
                            </Button>
                        </form>

                        {isLoading ? (
                            <div className="flex h-48 items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : isError || !logs ? (
                            <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive text-center">
                                Failed to load authorization logs.
                            </div>
                        ) : (
                            <>
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
                                                    {l.authdate || '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Pagination
                                    links={logs.links}
                                    from={logs.from}
                                    to={logs.to}
                                    total={logs.total}
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
