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
import { type Plan } from '@/types/models';
import api from '@/lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PlanOptions {
    bandwidths: { id: number; name: string }[];
    routers: string[];
}

export default function PlanForm() {
    const { id } = useParams<{ id: string }>();
    const editing = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Form fields state
    const [name, setName] = useState('');
    const [type, setType] = useState<'Hotspot' | 'PPPOE'>('Hotspot');
    const [bandwidthPolicy, setBandwidthPolicy] = useState<'Unlimited' | 'Limited'>('Unlimited');
    const [limitType, setLimitType] = useState<'Time_Limit' | 'Data_Limit' | 'Both_Limit'>('Time_Limit');
    const [timeLimit, setTimeLimit] = useState<number>(0);
    const [timeUnit, setTimeUnit] = useState<'Mins' | 'Hrs'>('Hrs');
    const [dataLimit, setDataLimit] = useState<number>(0);
    const [dataUnit, setDataUnit] = useState<'MB' | 'GB'>('GB');
    const [bandwidthId, setBandwidthId] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [dataUsageGb, setDataUsageGb] = useState<number>(0);
    const [dailyQuota, setDailyQuota] = useState<number>(0);
    const [sharedUsers, setSharedUsers] = useState<number>(1);
    const [validity, setValidity] = useState<number>(30);
    const [validityUnit, setValidityUnit] = useState<string>('Days');
    const [routerName, setRouterName] = useState<string>('');
    const [pool, setPool] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch drop-down options
    const { data: optionsData, isLoading: optionsLoading } = useQuery<PlanOptions>({
        queryKey: ['plansOptions'],
        queryFn: async () => {
            const res = await api.get('/plans/options');
            return res.data;
        },
    });

    // Fetch existing plan details if editing
    const { data: plan, isLoading: planLoading } = useQuery<Plan>({
        queryKey: ['plans', id],
        queryFn: async () => {
            const res = await api.get(`/plans/${id}`);
            return res.data;
        },
        enabled: editing,
    });

    useEffect(() => {
        if (plan) {
            setName(plan.name || '');
            setType(plan.type || 'Hotspot');
            setBandwidthPolicy(plan.bandwidth_policy || 'Unlimited');
            setLimitType(plan.limit_type || 'Time_Limit');
            setTimeLimit(plan.time_limit || 0);
            setTimeUnit(plan.time_unit || 'Hrs');
            setDataLimit(plan.data_limit || 0);
            setDataUnit(plan.data_unit || 'GB');
            setBandwidthId(plan.bandwidth_id ? String(plan.bandwidth_id) : '');
            setPrice(plan.price || 0);
            setDataUsageGb(plan.data_usage_gb || 0);
            setDailyQuota(plan.daily_quota || 0);
            setSharedUsers(plan.shared_users || 1);
            setValidity(plan.validity || 30);
            setValidityUnit(plan.validity_unit || 'Days');
            setRouterName(plan.router_name || '');
            setPool(plan.pool || '');
        }
    }, [plan]);

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            if (editing) {
                return await api.put(`/plans/${id}`, payload);
            } else {
                return await api.post('/plans', payload);
            }
        },
        onSuccess: () => {
            toast.success(editing ? 'Plan updated successfully.' : 'Plan created successfully.');
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            navigate('/plans');
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
            name,
            type,
            bandwidth_policy: bandwidthPolicy,
            limit_type: limitType,
            time_limit: timeLimit,
            time_unit: timeUnit,
            data_limit: dataLimit,
            data_unit: dataUnit,
            bandwidth_id: bandwidthId ? Number(bandwidthId) : null,
            price,
            data_usage_gb: dataUsageGb,
            daily_quota: dailyQuota,
            shared_users: sharedUsers,
            validity,
            validity_unit: validityUnit,
            router_name: routerName || null,
            pool: pool || null,
        });
    };

    const showData = limitType !== 'Time_Limit';
    const showTime = limitType !== 'Data_Limit';
    const bandwidths = optionsData?.bandwidths || [];
    const routers = optionsData?.routers || [];

    if (optionsLoading || (editing && planLoading)) {
        return (
            <AppLayout title={editing ? 'Edit Plan' : 'Add Plan'}>
                <div className="flex h-48 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title={editing ? 'Edit Plan' : 'Add Plan'}>
            <div className="mx-auto max-w-3xl">
                <Button asChild variant="ghost" className="mb-4 cursor-pointer">
                    <Link to="/plans">
                        <ArrowLeft className="mr-1 size-4" /> Back
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Service plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Plan Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Plan Type</Label>
                                    <Select
                                        value={type}
                                        onValueChange={(v) => setType(v as 'Hotspot' | 'PPPOE')}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Hotspot" className="cursor-pointer">Hotspot</SelectItem>
                                            <SelectItem value="PPPOE" className="cursor-pointer">PPPoE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Bandwidth Policy</Label>
                                    <Select
                                        value={bandwidthPolicy}
                                        onValueChange={(v) => setBandwidthPolicy(v as 'Unlimited' | 'Limited')}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unlimited" className="cursor-pointer">Unlimited</SelectItem>
                                            <SelectItem value="Limited" className="cursor-pointer">Limited</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Limit Type</Label>
                                    <Select
                                        value={limitType}
                                        onValueChange={(v) => setLimitType(v as 'Time_Limit' | 'Data_Limit' | 'Both_Limit')}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Time_Limit" className="cursor-pointer">Time Limit</SelectItem>
                                            <SelectItem value="Data_Limit" className="cursor-pointer">Data Limit</SelectItem>
                                            <SelectItem value="Both_Limit" className="cursor-pointer">Both Limit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {showTime && (
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="col-span-2 grid gap-2">
                                            <Label htmlFor="time_limit">Time Limit</Label>
                                            <Input
                                                id="time_limit"
                                                type="number"
                                                value={timeLimit}
                                                onChange={(e) => setTimeLimit(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Unit</Label>
                                            <Select
                                                value={timeUnit}
                                                onValueChange={(v) => setTimeUnit(v as 'Mins' | 'Hrs')}
                                            >
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Hrs" className="cursor-pointer">Hrs</SelectItem>
                                                    <SelectItem value="Mins" className="cursor-pointer">Mins</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                                {showData && (
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="col-span-2 grid gap-2">
                                            <Label htmlFor="data_limit">Data Limit</Label>
                                            <Input
                                                id="data_limit"
                                                type="number"
                                                value={dataLimit}
                                                onChange={(e) => setDataLimit(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Unit</Label>
                                            <Select
                                                value={dataUnit}
                                                onValueChange={(v) => setDataUnit(v as 'MB' | 'GB')}
                                            >
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MB" className="cursor-pointer">MB</SelectItem>
                                                    <SelectItem value="GB" className="cursor-pointer">GB</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Bandwidth Profile</Label>
                                    <Select
                                        value={bandwidthId}
                                        onValueChange={(v) => setBandwidthId(v)}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue placeholder="Select bandwidth" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bandwidths.map((b) => (
                                                <SelectItem key={b.id} value={String(b.id)} className="cursor-pointer">
                                                    {b.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.bandwidth_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                    />
                                    <InputError message={errors.price} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="data_usage_gb">Data Usage (GB)</Label>
                                    <Input
                                        id="data_usage_gb"
                                        type="number"
                                        value={dataUsageGb}
                                        onChange={(e) => setDataUsageGb(Number(e.target.value))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="daily_quota">Daily Quota (GB)</Label>
                                    <Input
                                        id="daily_quota"
                                        type="number"
                                        value={dailyQuota}
                                        onChange={(e) => setDailyQuota(Number(e.target.value))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="shared_users">Shared Users</Label>
                                    <Input
                                        id="shared_users"
                                        type="number"
                                        value={sharedUsers}
                                        onChange={(e) => setSharedUsers(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 grid grid-cols-2 gap-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="validity">Validity</Label>
                                        <Input
                                            id="validity"
                                            type="number"
                                            value={validity}
                                            onChange={(e) => setValidity(Number(e.target.value))}
                                        />
                                        <InputError message={errors.validity} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Unit</Label>
                                        <Select
                                            value={validityUnit}
                                            onValueChange={(v) => setValidityUnit(v)}
                                        >
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Days" className="cursor-pointer">Days</SelectItem>
                                                <SelectItem value="Hour" className="cursor-pointer">Hours</SelectItem>
                                                <SelectItem value="Months" className="cursor-pointer">Months</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Router (NAS)</Label>
                                    <Select
                                        value={routerName}
                                        onValueChange={(v) => setRouterName(v)}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue placeholder="Select NAS" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {routers.map((r) => (
                                                <SelectItem key={r} value={r} className="cursor-pointer">
                                                    {r}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
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
