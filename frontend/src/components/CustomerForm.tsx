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
import { useState } from 'react';
import type { FormEventHandler } from 'react';

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

interface CustomerFormProps {
    customer?: Customer;
    onSubmit: (data: CustomerFormData, setErrors: (errors: Record<string, string[]>) => void) => void;
    processing?: boolean;
}

export default function CustomerForm({
    customer,
    onSubmit,
    processing = false,
}: CustomerFormProps) {
    const [formData, setFormData] = useState<CustomerFormData>({
        username: customer?.username ?? '',
        password: '',
        fullname: customer?.fullname ?? '',
        address: customer?.address ?? '',
        phonenumber: customer?.phonenumber ?? '',
        type: customer?.type ?? 'Hotspot',
        profile: customer?.profile ?? '',
        status: customer?.status ?? 'activate',
    });

    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const handleChange = (field: keyof CustomerFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for that field if it exists
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        onSubmit(formData, setErrors);
    };

    return (
        <form onSubmit={submit} className="grid max-w-2xl gap-5">
            <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                />
                <InputError message={errors.username?.[0]} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">
                    Password{' '}
                    {customer && (
                        <span className="text-xs text-muted-foreground font-normal">
                            (leave blank to keep current)
                        </span>
                    )}
                </Label>
                <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                />
                <InputError message={errors.password?.[0]} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="fullname">Full name</Label>
                <Input
                    id="fullname"
                    value={formData.fullname}
                    onChange={(e) => handleChange('fullname', e.target.value)}
                />
                <InputError message={errors.fullname?.[0]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="phonenumber">Phone</Label>
                    <Input
                        id="phonenumber"
                        value={formData.phonenumber}
                        onChange={(e) => handleChange('phonenumber', e.target.value)}
                    />
                    <InputError message={errors.phonenumber?.[0]} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                        value={formData.type || undefined}
                        onValueChange={(v) => handleChange('type', v)}
                    >
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Hotspot">Hotspot</SelectItem>
                            <SelectItem value="PPPOE">PPPoE</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.type?.[0]} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                />
                <InputError message={errors.address?.[0]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="profile">Profile</Label>
                    <Input
                        id="profile"
                        value={formData.profile}
                        onChange={(e) => handleChange('profile', e.target.value)}
                    />
                    <InputError message={errors.profile?.[0]} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(v) => handleChange('status', v)}
                    >
                        <SelectTrigger id="status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="activate">Active</SelectItem>
                            <SelectItem value="deactivate">Inactive</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.status?.[0]} />
                </div>
            </div>

            <div>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : customer ? 'Save changes' : 'Create customer'}
                </Button>
            </div>
        </form>
    );
}
