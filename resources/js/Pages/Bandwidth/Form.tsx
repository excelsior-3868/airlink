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
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function BandwidthForm({ bandwidth }: { bandwidth?: Bandwidth }) {
    const editing = !!bandwidth;
    const { data, setData, post, put, processing, errors } = useForm({
        name: bandwidth?.name ?? '',
        rate_down: bandwidth?.rate_down ?? 0,
        rate_down_unit: bandwidth?.rate_down_unit ?? 'Mbps',
        rate_up: bandwidth?.rate_up ?? 0,
        rate_up_unit: bandwidth?.rate_up_unit ?? 'Mbps',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        editing
            ? put(route('bandwidth.update', bandwidth!.id))
            : post(route('bandwidth.store'));
    };

    return (
        <AppLayout title={editing ? 'Edit Bandwidth' : 'Add Bandwidth'}>
            <Head title="Bandwidth" />
            <div className="mx-auto max-w-2xl">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href={route('bandwidth.index')}>
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
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 grid gap-2">
                                    <Label htmlFor="rate_down">Rate Download</Label>
                                    <Input
                                        id="rate_down"
                                        type="number"
                                        value={data.rate_down}
                                        onChange={(e) =>
                                            setData('rate_down', Number(e.target.value))
                                        }
                                    />
                                    <InputError message={errors.rate_down} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Unit</Label>
                                    <Select
                                        value={data.rate_down_unit}
                                        onValueChange={(v) =>
                                            setData('rate_down_unit', v as 'Kbps' | 'Mbps')
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Kbps">Kbps</SelectItem>
                                            <SelectItem value="Mbps">Mbps</SelectItem>
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
                                        value={data.rate_up}
                                        onChange={(e) =>
                                            setData('rate_up', Number(e.target.value))
                                        }
                                    />
                                    <InputError message={errors.rate_up} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Unit</Label>
                                    <Select
                                        value={data.rate_up_unit}
                                        onValueChange={(v) =>
                                            setData('rate_up_unit', v as 'Kbps' | 'Mbps')
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Kbps">Kbps</SelectItem>
                                            <SelectItem value="Mbps">Mbps</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Button type="submit" disabled={processing}>
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
