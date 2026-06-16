import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/Layouts/AppLayout';
import { type Pool } from '@/types/models';
import api from '@/lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PoolOptions {
    routers: string[];
}

export default function PoolForm() {
    const { id } = useParams<{ id: string }>();
    const editing = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Form fields state
    const [poolName, setPoolName] = useState('');
    const [rangeIp, setRangeIp] = useState('');
    const [routerName, setRouterName] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch router options
    const { data: optionsData, isLoading: optionsLoading } = useQuery<PoolOptions>({
        queryKey: ['poolsOptions'],
        queryFn: async () => {
            const res = await api.get('/pools/options');
            return res.data;
        },
    });

    // Fetch existing pool details if editing
    const { data: pool, isLoading: poolLoading } = useQuery<Pool>({
        queryKey: ['pools', id],
        queryFn: async () => {
            const res = await api.get(`/pools/${id}`);
            return res.data;
        },
        enabled: editing,
    });

    useEffect(() => {
        if (pool) {
            setPoolName(pool.pool_name || '');
            setRangeIp(pool.range_ip || '');
            setRouterName(pool.router_name || '');
        }
    }, [pool]);

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            if (editing) {
                return await api.put(`/pools/${id}`, payload);
            } else {
                return await api.post('/pools', payload);
            }
        },
        onSuccess: () => {
            toast.success(editing ? 'Pool updated successfully.' : 'Pool created successfully.');
            queryClient.invalidateQueries({ queryKey: ['pools'] });
            navigate('/pools');
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
                toast.error(err.response?.data?.message || 'Something went wrong.');
            }
        },
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setErrors({});
        mutation.mutate({
            pool_name: poolName,
            range_ip: rangeIp,
            router_name: routerName || null,
        });
    };

    const routers = optionsData?.routers || [];

    if (optionsLoading || (editing && poolLoading)) {
        return (
            <AppLayout title={editing ? 'Edit Pool' : 'Add Pool'}>
                <div className="flex h-48 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title={editing ? 'Edit Pool' : 'Add Pool'}>
            <div className="mx-auto max-w-2xl">
                <Button asChild variant="ghost" className="mb-4 cursor-pointer">
                    <Link to="/pools">
                        <ArrowLeft className="mr-1 size-4" /> Back
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>IP Pool</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="pool_name">Pool Name</Label>
                                <Input
                                    id="pool_name"
                                    value={poolName}
                                    onChange={(e) => setPoolName(e.target.value)}
                                />
                                <InputError message={errors.pool_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="range_ip">Range IP</Label>
                                <Input
                                    id="range_ip"
                                    placeholder="ex: 192.168.88.2-192.168.88.254"
                                    value={rangeIp}
                                    onChange={(e) => setRangeIp(e.target.value)}
                                />
                                <InputError message={errors.range_ip} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Router</Label>
                                <Select
                                    value={routerName}
                                    onValueChange={(v) => setRouterName(v)}
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue placeholder="Select a router" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {routers.map((r) => (
                                            <SelectItem key={r} value={r} className="cursor-pointer">
                                                {r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.router_name} />
                            </div>
                            <div>
                                <Button type="submit" disabled={mutation.isPending} className="cursor-pointer">
                                    {editing ? 'Save changes' : 'Save'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
