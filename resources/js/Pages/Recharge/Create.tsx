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
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

interface PlanOption {
    id: number;
    name: string;
    type: string;
    price: number | null;
    validity: number;
    validity_unit: string | null;
}

export default function RechargeCreate({
    customer,
    plans,
    activeRecharge,
}: {
    customer: { id: number; username: string; fullname: string | null; profile: string | null; type: string | null; status: string };
    plans: PlanOption[];
    activeRecharge: { plan_name: string; expiration: string | null } | null;
}) {
    const { data, setData, post, processing, errors } = useForm({
        plan_id: '',
        password: '',
        method: 'admin',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('recharge.store', customer.id));
    };

    const selectedPlan = plans.find((p) => String(p.id) === data.plan_id);

    return (
        <AppLayout title={`Recharge: ${customer.username}`}>
            <Head title={`Recharge ${customer.username}`} />
            <div className="mx-auto max-w-2xl">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href={route('customers.show', customer.id)}>
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
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">Active until: </span>
                                    {activeRecharge.expiration} ({activeRecharge.plan_name})
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
                                    value={data.plan_id || undefined}
                                    onValueChange={(v) => setData('plan_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name} — {p.price ?? 0} ({p.validity} {p.validity_unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.plan_id} />
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
                                        <span className="text-xs text-muted-foreground">
                                            (blank = username)
                                        </span>
                                    </Label>
                                    <Input
                                        id="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="method">Method</Label>
                                    <Input
                                        id="method"
                                        value={data.method}
                                        onChange={(e) => setData('method', e.target.value)}
                                    />
                                    <InputError message={errors.method} />
                                </div>
                            </div>

                            <div>
                                <Button type="submit" disabled={processing}>
                                    Recharge now
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
