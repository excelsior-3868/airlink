import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/InputError';
import { type Customer } from '@/types/models';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type CustomerFormData = {
    username: string;
    password: string;
    fullname: string;
    address: string;
    phonenumber: string;
    type: string;
    profile: string;
    status: string;
};

export default function CustomerForm({
    customer,
    submitUrl,
    method,
}: {
    customer?: Customer;
    submitUrl: string;
    method: 'post' | 'put';
}) {
    const { data, setData, post, put, processing, errors } =
        useForm<CustomerFormData>({
            username: customer?.username ?? '',
            password: '',
            fullname: customer?.fullname ?? '',
            address: customer?.address ?? '',
            phonenumber: customer?.phonenumber ?? '',
            type: customer?.type ?? '',
            profile: customer?.profile ?? '',
            status: customer?.status ?? 'activate',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        method === 'post' ? post(submitUrl) : put(submitUrl);
    };

    return (
        <form onSubmit={submit} className="grid max-w-2xl gap-5">
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
                    Password{' '}
                    {customer && (
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

            <div className="grid gap-2">
                <Label htmlFor="fullname">Full name</Label>
                <Input
                    id="fullname"
                    value={data.fullname}
                    onChange={(e) => setData('fullname', e.target.value)}
                />
                <InputError message={errors.fullname} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="phonenumber">Phone</Label>
                    <Input
                        id="phonenumber"
                        value={data.phonenumber}
                        onChange={(e) =>
                            setData('phonenumber', e.target.value)
                        }
                    />
                    <InputError message={errors.phonenumber} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                        value={data.type || undefined}
                        onValueChange={(v) => setData('type', v)}
                    >
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Hotspot">Hotspot</SelectItem>
                            <SelectItem value="PPPOE">PPPoE</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.type} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                />
                <InputError message={errors.address} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="profile">Profile</Label>
                    <Input
                        id="profile"
                        value={data.profile}
                        onChange={(e) => setData('profile', e.target.value)}
                    />
                    <InputError message={errors.profile} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={data.status}
                        onValueChange={(v) => setData('status', v)}
                    >
                        <SelectTrigger id="status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="activate">Active</SelectItem>
                            <SelectItem value="deactivate">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.status} />
                </div>
            </div>

            <div>
                <Button type="submit" disabled={processing}>
                    {customer ? 'Save changes' : 'Create customer'}
                </Button>
            </div>
        </form>
    );
}
