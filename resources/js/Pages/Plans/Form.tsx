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
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function PlanForm({
    plan,
    bandwidths,
    routers,
}: {
    plan?: Plan;
    bandwidths: { id: number; name: string }[];
    routers: string[];
}) {
    const editing = !!plan;
    const { data, setData, post, put, processing, errors } = useForm({
        name: plan?.name ?? '',
        type: plan?.type ?? 'Hotspot',
        bandwidth_policy: plan?.bandwidth_policy ?? 'Unlimited',
        limit_type: plan?.limit_type ?? 'Time_Limit',
        time_limit: plan?.time_limit ?? 0,
        time_unit: plan?.time_unit ?? 'Hrs',
        data_limit: plan?.data_limit ?? 0,
        data_unit: plan?.data_unit ?? 'GB',
        bandwidth_id: plan?.bandwidth_id ? String(plan.bandwidth_id) : '',
        price: plan?.price ?? 0,
        data_usage_gb: plan?.data_usage_gb ?? 0,
        daily_quota: plan?.daily_quota ?? 0,
        shared_users: plan?.shared_users ?? 1,
        validity: plan?.validity ?? 30,
        validity_unit: plan?.validity_unit ?? 'Days',
        router_name: plan?.router_name ?? '',
        pool: plan?.pool ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        editing ? put(route('plans.update', plan!.id)) : post(route('plans.store'));
    };

    const showData = data.limit_type !== 'Time_Limit';
    const showTime = data.limit_type !== 'Data_Limit';

    return (
        <AppLayout title={editing ? 'Edit Plan' : 'Add Plan'}>
            <Head title="Plan" />
            <div className="mx-auto max-w-3xl">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href={route('plans.index')}>
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
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Plan Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(v) =>
                                            setData('type', v as 'Hotspot' | 'PPPOE')
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Hotspot">Hotspot</SelectItem>
                                            <SelectItem value="PPPOE">PPPoE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Bandwidth Policy</Label>
                                    <Select
                                        value={data.bandwidth_policy ?? 'Unlimited'}
                                        onValueChange={(v) =>
                                            setData(
                                                'bandwidth_policy',
                                                v as 'Unlimited' | 'Limited',
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unlimited">
                                                Unlimited
                                            </SelectItem>
                                            <SelectItem value="Limited">Limited</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Limit Type</Label>
                                    <Select
                                        value={data.limit_type ?? 'Time_Limit'}
                                        onValueChange={(v) =>
                                            setData(
                                                'limit_type',
                                                v as 'Time_Limit' | 'Data_Limit' | 'Both_Limit',
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Time_Limit">
                                                Time Limit
                                            </SelectItem>
                                            <SelectItem value="Data_Limit">
                                                Data Limit
                                            </SelectItem>
                                            <SelectItem value="Both_Limit">
                                                Both Limit
                                            </SelectItem>
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
                                                value={data.time_limit}
                                                onChange={(e) =>
                                                    setData(
                                                        'time_limit',
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Unit</Label>
                                            <Select
                                                value={data.time_unit ?? 'Hrs'}
                                                onValueChange={(v) =>
                                                    setData('time_unit', v as 'Mins' | 'Hrs')
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Hrs">Hrs</SelectItem>
                                                    <SelectItem value="Mins">Mins</SelectItem>
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
                                                value={data.data_limit}
                                                onChange={(e) =>
                                                    setData(
                                                        'data_limit',
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Unit</Label>
                                            <Select
                                                value={data.data_unit ?? 'GB'}
                                                onValueChange={(v) =>
                                                    setData('data_unit', v as 'MB' | 'GB')
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MB">MB</SelectItem>
                                                    <SelectItem value="GB">GB</SelectItem>
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
                                        value={data.bandwidth_id || undefined}
                                        onValueChange={(v) => setData('bandwidth_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select bandwidth" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bandwidths.map((b) => (
                                                <SelectItem key={b.id} value={String(b.id)}>
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
                                        value={data.price}
                                        onChange={(e) =>
                                            setData('price', Number(e.target.value))
                                        }
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
                                        value={data.data_usage_gb}
                                        onChange={(e) =>
                                            setData('data_usage_gb', Number(e.target.value))
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="daily_quota">Daily Quota (GB)</Label>
                                    <Input
                                        id="daily_quota"
                                        type="number"
                                        value={data.daily_quota}
                                        onChange={(e) =>
                                            setData('daily_quota', Number(e.target.value))
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="shared_users">Shared Users</Label>
                                    <Input
                                        id="shared_users"
                                        type="number"
                                        value={data.shared_users}
                                        onChange={(e) =>
                                            setData('shared_users', Number(e.target.value))
                                        }
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
                                            value={data.validity}
                                            onChange={(e) =>
                                                setData('validity', Number(e.target.value))
                                            }
                                        />
                                        <InputError message={errors.validity} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Unit</Label>
                                        <Select
                                            value={data.validity_unit ?? 'Days'}
                                            onValueChange={(v) => setData('validity_unit', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Days">Days</SelectItem>
                                                <SelectItem value="Hour">Hours</SelectItem>
                                                <SelectItem value="Months">Months</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Router (NAS)</Label>
                                    <Select
                                        value={data.router_name || undefined}
                                        onValueChange={(v) => setData('router_name', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select NAS" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {routers.map((r) => (
                                                <SelectItem key={r} value={r}>
                                                    {r}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Button type="submit" disabled={processing}>
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
