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
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function PoolForm({
    pool,
    routers,
}: {
    pool?: Pool;
    routers: string[];
}) {
    const editing = !!pool;
    const { data, setData, post, put, processing, errors } = useForm({
        pool_name: pool?.pool_name ?? '',
        range_ip: pool?.range_ip ?? '',
        router_name: pool?.router_name ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        editing ? put(route('pools.update', pool!.id)) : post(route('pools.store'));
    };

    return (
        <AppLayout title={editing ? 'Edit Pool' : 'Add Pool'}>
            <Head title="IP Pool" />
            <div className="mx-auto max-w-2xl">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href={route('pools.index')}>
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
                                    value={data.pool_name}
                                    onChange={(e) => setData('pool_name', e.target.value)}
                                />
                                <InputError message={errors.pool_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="range_ip">Range IP</Label>
                                <Input
                                    id="range_ip"
                                    placeholder="ex: 192.168.88.2-192.168.88.254"
                                    value={data.range_ip}
                                    onChange={(e) => setData('range_ip', e.target.value)}
                                />
                                <InputError message={errors.range_ip} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Router</Label>
                                <Select
                                    value={data.router_name || undefined}
                                    onValueChange={(v) => setData('router_name', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a router" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {routers.map((r) => (
                                            <SelectItem key={r} value={r}>
                                                {r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.router_name} />
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
