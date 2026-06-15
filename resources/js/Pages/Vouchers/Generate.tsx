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
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

interface PlanOption {
    id: number;
    name: string;
    type: string;
    price: number | null;
}

export default function VouchersGenerate({ plans }: { plans: PlanOption[] }) {
    const { data, setData, post, processing, errors } = useForm({
        plan_id: '',
        count: 10,
        code_length: 6,
        batch: '',
        generated_for: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('vouchers.store'));
    };

    return (
        <AppLayout title="Generate Vouchers">
            <Head title="Generate Vouchers" />
            <div className="mx-auto max-w-2xl">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href={route('vouchers.index')}>
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
                                    value={data.plan_id || undefined}
                                    onValueChange={(v) => setData('plan_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
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
                                        value={data.count}
                                        onChange={(e) => setData('count', Number(e.target.value))}
                                    />
                                    <InputError message={errors.count} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="code_length">Code length</Label>
                                    <Input
                                        id="code_length"
                                        type="number"
                                        value={data.code_length}
                                        onChange={(e) => setData('code_length', Number(e.target.value))}
                                    />
                                    <InputError message={errors.code_length} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="batch">Batch name (optional)</Label>
                                    <Input
                                        id="batch"
                                        value={data.batch}
                                        onChange={(e) => setData('batch', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="generated_for">Generated for (optional)</Label>
                                    <Input
                                        id="generated_for"
                                        value={data.generated_for}
                                        onChange={(e) => setData('generated_for', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Button type="submit" disabled={processing}>
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
