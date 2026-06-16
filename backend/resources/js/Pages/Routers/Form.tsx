import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/Layouts/AppLayout';
import { type RouterModel } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function RouterForm({ router }: { router?: RouterModel }) {
    const editing = !!router;
    const { data, setData, post, put, processing, errors } = useForm({
        name: router?.name ?? '',
        ip_address: router?.ip_address ?? '',
        username: router?.username ?? '',
        password: '',
        api_port: router?.api_port ?? 8728,
        use_ssl: router?.use_ssl ?? false,
        description: router?.description ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        editing ? put(route('routers.update', router!.id)) : post(route('routers.store'));
    };

    return (
        <AppLayout title={editing ? 'Edit Router' : 'Add Router'}>
            <Head title="Router" />
            <div className="mx-auto max-w-2xl">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href={route('routers.index')}>
                        <ArrowLeft className="mr-1 size-4" /> Back
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>RouterOS device</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Router Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 grid gap-2">
                                    <Label htmlFor="ip_address">IP Address</Label>
                                    <Input
                                        id="ip_address"
                                        value={data.ip_address}
                                        onChange={(e) => setData('ip_address', e.target.value)}
                                    />
                                    <InputError message={errors.ip_address} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="api_port">API Port</Label>
                                    <Input
                                        id="api_port"
                                        type="number"
                                        value={data.api_port}
                                        onChange={(e) =>
                                            setData('api_port', Number(e.target.value))
                                        }
                                    />
                                    <InputError message={errors.api_port} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                />
                                <InputError message={errors.username} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Router Secret{' '}
                                    {editing && (
                                        <span className="text-xs text-muted-foreground">
                                            (leave blank to keep current)
                                        </span>
                                    )}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    className="size-4"
                                    checked={data.use_ssl}
                                    onChange={(e) => setData('use_ssl', e.target.checked)}
                                />
                                Use SSL (api-ssl, port 8729)
                            </label>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} />
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
