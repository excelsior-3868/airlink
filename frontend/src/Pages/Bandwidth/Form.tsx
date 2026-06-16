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
import { type Bandwidth } from '@/types/models';
import api from '@/lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function BandwidthForm() {
    const { id } = useParams<{ id: string }>();
    const editing = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [rateDown, setRateDown] = useState<number>(0);
    const [rateDownUnit, setRateDownUnit] = useState<'Kbps' | 'Mbps'>('Mbps');
    const [rateUp, setRateUp] = useState<number>(0);
    const [rateUpUnit, setRateUpUnit] = useState<'Kbps' | 'Mbps'>('Mbps');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch existing bandwidth details if editing
    const { data: bandwidth, isLoading } = useQuery<Bandwidth>({
        queryKey: ['bandwidth', id],
        queryFn: async () => {
            const res = await api.get(`/bandwidth/${id}`);
            return res.data;
        },
        enabled: editing,
    });

    useEffect(() => {
        if (bandwidth) {
            setName(bandwidth.name || '');
            setRateDown(bandwidth.rate_down || 0);
            setRateDownUnit(bandwidth.rate_down_unit || 'Mbps');
            setRateUp(bandwidth.rate_up || 0);
            setRateUpUnit(bandwidth.rate_up_unit || 'Mbps');
        }
    }, [bandwidth]);

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            if (editing) {
                return await api.put(`/bandwidth/${id}`, payload);
            } else {
                return await api.post('/bandwidth', payload);
            }
        },
        onSuccess: () => {
            toast.success(editing ? 'Bandwidth plan updated.' : 'Bandwidth plan created.');
            queryClient.invalidateQueries({ queryKey: ['bandwidth'] });
            navigate('/bandwidth');
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
            rate_down: rateDown,
            rate_down_unit: rateDownUnit,
            rate_up: rateUp,
            rate_up_unit: rateUpUnit,
        });
    };

    if (editing && isLoading) {
        return (
            <AppLayout title="Edit Bandwidth">
                <div className="flex h-48 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title={editing ? 'Edit Bandwidth' : 'Add Bandwidth'}>
            <div className="mx-auto max-w-2xl">
                <Button asChild variant="ghost" className="mb-4 cursor-pointer">
                    <Link to="/bandwidth">
                        <ArrowLeft className="mr-1 size-4" /> Back
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Bandwidth profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name">BW Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 grid gap-2">
                                    <Label htmlFor="rate_down">Rate Download</Label>
                                    <Input
                                        id="rate_down"
                                        type="number"
                                        value={rateDown}
                                        onChange={(e) => setRateDown(Number(e.target.value))}
                                    />
                                    <InputError message={errors.rate_down} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Unit</Label>
                                    <Select
                                        value={rateDownUnit}
                                        onValueChange={(v) => setRateDownUnit(v as 'Kbps' | 'Mbps')}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Kbps" className="cursor-pointer">Kbps</SelectItem>
                                            <SelectItem value="Mbps" className="cursor-pointer">Mbps</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 grid gap-2">
                                    <Label htmlFor="rate_up">Rate Upload</Label>
                                    <Input
                                        id="rate_up"
                                        type="number"
                                        value={rateUp}
                                        onChange={(e) => setRateUp(Number(e.target.value))}
                                    />
                                    <InputError message={errors.rate_up} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Unit</Label>
                                    <Select
                                        value={rateUpUnit}
                                        onValueChange={(v) => setRateUpUnit(v as 'Kbps' | 'Mbps')}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Kbps" className="cursor-pointer">Kbps</SelectItem>
                                            <SelectItem value="Mbps" className="cursor-pointer">Mbps</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Button type="submit" disabled={mutation.isPending} className="cursor-pointer">
                                    {editing ? 'Save changes' : 'Submit'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
