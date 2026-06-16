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
import api from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PlanOption {
    id: number;
    name: string;
    type: string;
    price: number | null;
}

interface VoucherOptions {
    plans: PlanOption[];
}

export default function VouchersGenerate() {
    const navigate = useNavigate();

    // Form fields state
    const [planId, setPlanId] = useState('');
    const [count, setCount] = useState<number>(10);
    const [codeLength, setCodeLength] = useState<number>(6);
    const [batch, setBatch] = useState('');
    const [generatedFor, setGeneratedFor] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch plan options
    const { data: optionsData, isLoading } = useQuery<VoucherOptions>({
        queryKey: ['vouchersOptions'],
        queryFn: async () => {
            const res = await api.get('/vouchers/options');
            return res.data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            return await api.post('/vouchers', payload);
        },
        onSuccess: () => {
            toast.success('Vouchers generated successfully.');
            navigate('/vouchers');
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
            plan_id: planId ? Number(planId) : null,
            count,
            code_length: codeLength,
            batch: batch || null,
            generated_for: generatedFor || null,
        });
    };

    const plans = optionsData?.plans || [];

    if (isLoading) {
        return (
            <AppLayout title="Generate Vouchers">
                <div className="flex h-48 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Generate Vouchers">
            <div className="mx-auto max-w-2xl">
                <Button asChild variant="ghost" className="mb-4 cursor-pointer">
                    <Link to="/vouchers">
                        <ArrowLeft className="mr-1 size-4" /> Back
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Generate a batch of vouchers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-2">
                                <Label>Plan</Label>
                                <Select
                                    value={planId}
                                    onValueChange={(v) => setPlanId(v)}
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue placeholder="Select a plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)} className="cursor-pointer">
                                                {p.name} ({p.type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.plan_id} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="count">Number of vouchers</Label>
                                    <Input
                                        id="count"
                                        type="number"
                                        value={count}
                                        onChange={(e) => setCount(Number(e.target.value))}
                                    />
                                    <InputError message={errors.count} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="code_length">Code length</Label>
                                    <Input
                                        id="code_length"
                                        type="number"
                                        value={codeLength}
                                        onChange={(e) => setCodeLength(Number(e.target.value))}
                                    />
                                    <InputError message={errors.code_length} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="batch">Batch name (optional)</Label>
                                    <Input
                                        id="batch"
                                        value={batch}
                                        onChange={(e) => setBatch(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="generated_for">Generated for (optional)</Label>
                                    <Input
                                        id="generated_for"
                                        value={generatedFor}
                                        onChange={(e) => setGeneratedFor(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Button type="submit" disabled={mutation.isPending} className="cursor-pointer">
                                    Generate
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
