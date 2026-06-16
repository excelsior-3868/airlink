import InputError from '@/components/InputError';
import { Badge } from '@/components/ui/badge';
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
import { type Customer, type Plan, type Recharge, type Transaction } from '@/types/models';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import { toast } from 'sonner';

export default function RechargeCreate() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [planId, setPlanId] = useState('');
    const [password, setPassword] = useState('');
    const [method, setMethod] = useState('admin');
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // Fetch customer details and history
    const { data: customerData, isLoading: isCustomerLoading, isError: isCustomerError } = useQuery<{
        customer: Customer;
        history: {
            recharges: Recharge[];
            transactions: Transaction[];
        };
    }>({
        queryKey: ['customer-detail', id],
        queryFn: async () => {
            const res = await api.get(`/customers/${id}`);
            return res.data;
        },
    });

    // Fetch recharge plans
    const { data: plansResponse, isLoading: isPlansLoading, isError: isPlansError } = useQuery<{
        data: Plan[];
    }>({
        queryKey: ['recharge-plans'],
        queryFn: async () => {
            const res = await api.get('/recharge/plans');
            return res.data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await api.post(`/customers/${id}/recharge`, payload);
            return res.data;
        },
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setErrors({});

        mutation.mutate(
            {
                plan_id: planId,
                password: password || undefined,
                method,
            },
            {
                onSuccess: (data) => {
                    toast.success(data.message || 'Customer recharged successfully.');
                    queryClient.invalidateQueries({ queryKey: ['customer-detail', id] });
                    queryClient.invalidateQueries({ queryKey: ['customers'] });
                    navigate(`/customers/${id}`);
                },
                onError: (err: any) => {
                    if (err.response?.status === 422 && err.response?.data?.errors) {
                        setErrors(err.response.data.errors);
                    } else {
                        toast.error(err.response?.data?.message || 'Recharge failed.');
                    }
                },
            }
        );
    };

    if (isCustomerLoading || isPlansLoading) {
        return (
            <AppLayout title="Recharge Customer">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    if (isCustomerError || isPlansError || !customerData?.customer) {
        return (
            <AppLayout title="Recharge Customer">
                <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive text-center">
                    Failed to load required information for recharge.
                </div>
            </AppLayout>
        );
    }

    const { customer } = customerData;
    const recharges = customerData.history?.recharges || [];
    const activeRecharge = recharges.find((r) => r.status === 'on');
    const plans = plansResponse?.data || [];
    const selectedPlan = plans.find((p) => String(p.id) === planId);

    return (
        <AppLayout title={`Recharge: ${customer.username}`}>
            <div className="mx-auto max-w-2xl">
                <Button asChild variant="ghost" className="mb-4">
                    <Link to={`/customers/${id}`}>
                        <ArrowLeft className="mr-1 size-4" /> Back
                    </Link>
                </Button>

                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>{customer.username}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-muted-foreground">Current profile: </span>
                                {customer.profile ?? '—'}
                            </div>
                            <div>
                                <span className="text-muted-foreground">Status: </span>
                                <Badge variant="secondary">{customer.status}</Badge>
                            </div>
                            {activeRecharge && (
                                <div className="col-span-2 mt-2">
                                    <span className="text-muted-foreground">Active until: </span>
                                    <span className="font-semibold text-primary">{activeRecharge.expiration}</span> ({activeRecharge.plan_name})
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recharge</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-2">
                                <Label>Plan</Label>
                                <Select
                                    value={planId || undefined}
                                    onValueChange={(v) => {
                                        setPlanId(v);
                                        if (errors.plan_id) {
                                            setErrors((prev) => {
                                                const next = { ...prev };
                                                delete next.plan_id;
                                                return next;
                                            });
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name} — NPR {p.price ?? 0} ({p.validity} {p.validity_unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.plan_id?.[0]} />
                            </div>

                            {selectedPlan && (
                                <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                                    New expiry: {selectedPlan.validity} {selectedPlan.validity_unit} from today.
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        RADIUS password{' '}
                                        <span className="text-xs text-muted-foreground font-normal">
                                            (blank = username)
                                        </span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) {
                                                setErrors((prev) => {
                                                    const next = { ...prev };
                                                    delete next.password;
                                                    return next;
                                                });
                                            }
                                        }}
                                    />
                                    <InputError message={errors.password?.[0]} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="method">Method</Label>
                                    <Input
                                        id="method"
                                        value={method}
                                        onChange={(e) => {
                                            setMethod(e.target.value);
                                            if (errors.method) {
                                                setErrors((prev) => {
                                                    const next = { ...prev };
                                                    delete next.method;
                                                    return next;
                                                });
                                            }
                                        }}
                                    />
                                    <InputError message={errors.method?.[0]} />
                                </div>
                            </div>

                            <div>
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? 'Processing...' : 'Recharge now'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
