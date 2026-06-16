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
import { Head, router } from '@inertiajs/react';
import { RefreshCw, Wifi } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

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

export default function MonitorSessions({
    sessions,
    online,
    filters,
}: {
    sessions: Paginator<Session>;
    online: number;
    filters: { search?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('monitor.sessions'), { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Active Sessions">
            <Head title="Active Sessions" />
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
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="max-w-sm"
                                />
                                <Button type="submit" variant="secondary">
                                    Search
                                </Button>
                            </form>
                            <Button
                                variant="outline"
                                onClick={() => router.reload({ only: ['sessions', 'online'] })}
                            >
                                <RefreshCw className="mr-1 size-4" /> Refresh
                            </Button>
                        </div>

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
                                            {s.acctstarttime}
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
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
