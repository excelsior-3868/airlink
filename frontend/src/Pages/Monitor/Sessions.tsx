import Pagination, { type Paginator } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { RefreshCw, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';

interface Session {
    id: number;
    username: string;
    nasipaddress: string;
    framedipaddress: string;
    callingstationid: string;
    acctstarttime: string | null;
    mb_in: number;
    mb_out: number;
}

interface SessionsResponse {
    sessions: Paginator<Session>;
    online: number;
}

export default function MonitorSessions() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';

    const [searchInput, setSearchInput] = useState(search);

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    const { data: monitorData, isLoading, isError, isFetching } = useQuery<SessionsResponse>({
        queryKey: ['monitorSessions', page, search],
        queryFn: async () => {
            const res = await api.get('/monitor/sessions', {
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

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['monitorSessions'] });
    };

    const sessions = monitorData?.sessions;
    const online = monitorData?.online ?? 0;

    return (
        <AppLayout title="Active Sessions">
            <div className="mx-auto max-w-7xl space-y-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                            Online now
                        </CardTitle>
                        <Wifi className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{online.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <form onSubmit={submit} className="flex flex-1 gap-2">
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
                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                                disabled={isFetching}
                                className="cursor-pointer"
                            >
                                <RefreshCw className={`mr-1 size-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="flex h-48 items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : isError || !sessions ? (
                            <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive text-center">
                                Failed to load active sessions.
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Username</TableHead>
                                            <TableHead>NAS IP</TableHead>
                                            <TableHead>Framed IP</TableHead>
                                            <TableHead>MAC</TableHead>
                                            <TableHead>Started</TableHead>
                                            <TableHead className="text-right">↓ MB</TableHead>
                                            <TableHead className="text-right">↑ MB</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sessions.data.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                    No active sessions.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {sessions.data.map((s) => (
                                            <TableRow key={s.id}>
                                                <TableCell className="font-medium">{s.username}</TableCell>
                                                <TableCell className="font-mono text-xs">{s.nasipaddress}</TableCell>
                                                <TableCell className="font-mono text-xs">{s.framedipaddress}</TableCell>
                                                <TableCell className="font-mono text-xs">{s.callingstationid}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {s.acctstarttime || '—'}
                                                </TableCell>
                                                <TableCell className="text-right">{s.mb_in}</TableCell>
                                                <TableCell className="text-right">{s.mb_out}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Pagination
                                    links={sessions.links}
                                    from={sessions.from}
                                    to={sessions.to}
                                    total={sessions.total}
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
