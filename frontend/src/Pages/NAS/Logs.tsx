import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/lib/api';
import { type Router } from '@/types/models';
import { Terminal } from 'lucide-react';

export default function NASLogs() {
    const [selectedRouterId, setSelectedRouterId] = useState<string>('');

    // Fetch available routers
    const { data: routersData } = useQuery<{ data: Router[] }>({
        queryKey: ['routers', 'all'],
        queryFn: async () => {
            const res = await api.get('/routers?per_page=100');
            return res.data;
        }
    });

    // Fetch logs for the selected router
    const { data: logsData, isLoading, isError } = useQuery({
        queryKey: ['router_logs', selectedRouterId],
        queryFn: async () => {
            if (!selectedRouterId) return null;
            const res = await api.get(`/routers/${selectedRouterId}/logs`);
            return res.data.logs;
        },
        enabled: !!selectedRouterId,
        refetchInterval: 10000, // auto refresh every 10 seconds
    });

    return (
        <AppLayout title="NAS Router Logs">
            <div className="mx-auto max-w-7xl space-y-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Terminal className="size-5" />
                            Live RouterOS Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 max-w-md">
                            <Select value={selectedRouterId} onValueChange={setSelectedRouterId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a NAS Router..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {routersData?.data?.map((r) => (
                                        <SelectItem key={r.id} value={r.id.toString()}>
                                            {r.name} ({r.ip_address})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedRouterId ? (
                            <div className="rounded-md border mt-4 overflow-hidden">
                                {isLoading ? (
                                    <div className="flex h-32 items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : isError ? (
                                    <div className="p-4 text-center text-destructive bg-destructive/10">
                                        Failed to connect to the router or fetch logs. Please ensure the router is online and API is enabled.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto max-h-[600px]">
                                        <Table className="relative">
                                            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                                <TableRow>
                                                    <TableHead className="w-[180px]">Time</TableHead>
                                                    <TableHead className="w-[150px]">Topics</TableHead>
                                                    <TableHead>Message</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {logsData?.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                            No logs found on this router.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    logsData?.map((log: any, index: number) => (
                                                        <TableRow key={log['.id'] || index} className="text-xs font-mono">
                                                            <TableCell className="whitespace-nowrap">{log.time}</TableCell>
                                                            <TableCell className="whitespace-nowrap">{log.topics}</TableCell>
                                                            <TableCell className="break-all">{log.message}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-md border border-dashed mt-4">
                                Please select a NAS router from the dropdown to view its live logs.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
