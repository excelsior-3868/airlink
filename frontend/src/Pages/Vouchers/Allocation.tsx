import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/Layouts/AppLayout';
import api from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface AllocationData {
    allocation: string;
    first_id: number;
    last_id: number;
    count: number;
    matching_users: number;
}

export default function VoucherAllocation() {
    const queryClient = useQueryClient();

    // Form inputs state
    const [collector, setCollector] = useState('');
    const [idStart, setIdStart] = useState('');
    const [idEnd, setIdEnd] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch allocations
    const { data: allocations = [], isLoading, isError } = useQuery<AllocationData[]>({
        queryKey: ['voucher-allocations'],
        queryFn: async () => {
            const res = await api.get('/vouchers/allocations');
            return res.data;
        },
    });

    // Allocate mutation
    const mutation = useMutation({
        mutationFn: async (payload: { vou_collector: string; id_start: number; id_end: number }) => {
            return await api.post('/vouchers/allocate', payload);
        },
        onSuccess: (res) => {
            toast.success(res.data.message || 'Vouchers allocated successfully.');
            queryClient.invalidateQueries({ queryKey: ['voucher-allocations'] });
            // Clear form
            setCollector('');
            setIdStart('');
            setIdEnd('');
            setErrors({});
        },
        onError: (err: any) => {
            if (err.response?.status === 422) {
                const apiErrors = err.response.data.errors || {};
                const mappedErrors: Record<string, string> = {};
                Object.keys(apiErrors).forEach((key) => {
                    mappedErrors[key] = apiErrors[key][0];
                });
                setErrors(mappedErrors);
            } else {
                toast.error(err.response?.data?.message || 'Failed to allocate vouchers.');
            }
        },
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setErrors({});

        if (!collector) {
            setErrors(prev => ({ ...prev, vou_collector: 'Collector name is required.' }));
            return;
        }
        if (!idStart || isNaN(Number(idStart))) {
            setErrors(prev => ({ ...prev, id_start: 'Start ID must be a number.' }));
            return;
        }
        if (!idEnd || isNaN(Number(idEnd))) {
            setErrors(prev => ({ ...prev, id_end: 'End ID must be a number.' }));
            return;
        }
        if (Number(idStart) > Number(idEnd)) {
            setErrors(prev => ({ ...prev, id_end: 'End ID must be greater than or equal to Start ID.' }));
            return;
        }

        mutation.mutate({
            vou_collector: collector,
            id_start: parseInt(idStart, 10),
            id_end: parseInt(idEnd, 10),
        });
    };

    return (
        <AppLayout title="Voucher Allocation">
            <div className="mx-auto max-w-7xl space-y-5">
                <div className="grid gap-5 md:grid-cols-3">
                    {/* Allocation Form Card */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle>Allocate Vouchers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="collector">Collector Name</Label>
                                    <Input
                                        id="collector"
                                        placeholder="e.g. John Doe"
                                        value={collector}
                                        onChange={(e) => setCollector(e.target.value)}
                                    />
                                    <InputError message={errors.vou_collector} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="id_start">ID Start</Label>
                                        <Input
                                            id="id_start"
                                            placeholder="1"
                                            value={idStart}
                                            onChange={(e) => setIdStart(e.target.value)}
                                        />
                                        <InputError message={errors.id_start} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="id_end">ID End</Label>
                                        <Input
                                            id="id_end"
                                            placeholder="100"
                                            value={idEnd}
                                            onChange={(e) => setIdEnd(e.target.value)}
                                        />
                                        <InputError message={errors.id_end} />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="w-full bg-[#13366e] hover:bg-[#0f2a57]"
                                >
                                    {mutation.isPending ? 'Allocating...' : 'Allocate Range'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Active Allocations List Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Active Allocations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex h-48 items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : isError ? (
                                <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive text-center">
                                    Failed to load active allocations.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Collector Name</TableHead>
                                            <TableHead className="text-right">Voucher Count</TableHead>
                                            <TableHead className="text-center">ID Range</TableHead>
                                            <TableHead className="text-right">Active Users (Online)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(() => {
                                            const allocationsArray = Array.isArray(allocations)
                                                ? allocations
                                                : (allocations && typeof allocations === 'object' ? Object.values(allocations) : []);
                                            
                                            return (
                                                <>
                                                    {allocationsArray.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                                No vouchers allocated yet.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                    {allocationsArray.map((alloc: any, i: number) => (
                                                        <TableRow key={i}>
                                                            <TableCell className="font-semibold text-[#13366e]">
                                                                {alloc.allocation}
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                {alloc.count}
                                                            </TableCell>
                                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                                {alloc.first_id} — {alloc.last_id}
                                                            </TableCell>
                                                            <TableCell className="text-right font-semibold text-emerald-600">
                                                                {alloc.matching_users}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </>
                                            );
                                        })()}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
