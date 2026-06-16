import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/Layouts/AppLayout';
import { type RouterModel } from '@/types/models';
import api from '@/lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function RouterForm() {
    const { id } = useParams<{ id: string }>();
    const editing = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Form fields state
    const [name, setName] = useState('');
    const [ipAddress, setIpAddress] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [apiPort, setApiPort] = useState<number>(8728);
    const [useSsl, setUseSsl] = useState<boolean>(false);
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch existing router details if editing
    const { data: router, isLoading } = useQuery<RouterModel>({
        queryKey: ['routers', id],
        queryFn: async () => {
            const res = await api.get(`/routers/${id}`);
            return res.data;
        },
        enabled: editing,
    });

    useEffect(() => {
        if (router) {
            setName(router.name || '');
            setIpAddress(router.ip_address || '');
            setUsername(router.username || '');
            setApiPort(router.api_port || 8728);
            setUseSsl(router.use_ssl || false);
            setDescription(router.description || '');
        }
    }, [router]);

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            if (editing) {
                return await api.put(`/routers/${id}`, payload);
            } else {
                return await api.post('/routers', payload);
            }
        },
        onSuccess: () => {
            toast.success(editing ? 'Router updated successfully.' : 'Router created successfully.');
            queryClient.invalidateQueries({ queryKey: ['routers'] });
            navigate('/routers');
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
            ip_address: ipAddress,
            username,
            password: password || undefined, // send password only if set
            api_port: apiPort,
            use_ssl: useSsl,
            description: description || null,
        });
    };

    if (editing && isLoading) {
        return (
            <AppLayout title="Edit Router">
                <div className="flex h-48 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title={editing ? 'Edit Router' : 'Add Router'}>
            <div className="mx-auto max-w-2xl">
                <Button asChild variant="ghost" className="mb-4 cursor-pointer">
                    <Link to="/routers">
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
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 grid gap-2">
                                    <Label htmlFor="ip_address">IP Address</Label>
                                    <Input
                                        id="ip_address"
                                        value={ipAddress}
                                        onChange={(e) => setIpAddress(e.target.value)}
                                    />
                                    <InputError message={errors.ip_address} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="api_port">API Port</Label>
                                    <Input
                                        id="api_port"
                                        type="number"
                                        value={apiPort}
                                        onChange={(e) => setApiPort(Number(e.target.value))}
                                    />
                                    <InputError message={errors.api_port} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <InputError message={errors.password} />
                            </div>
                            <label className="flex items-center gap-2 text-sm select-none cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="size-4 rounded border-input"
                                    checked={useSsl}
                                    onChange={(e) => setUseSsl(e.target.checked)}
                                />
                                Use SSL (api-ssl, port 8729)
                            </label>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <InputError message={errors.description} />
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
