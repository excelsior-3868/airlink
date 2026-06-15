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

export default function MessagesCreate({ recipients }: { recipients: string[] }) {
    const { data, setData, post, processing, errors } = useForm({
        to_user: '',
        title: '',
        message: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('messages.store'));
    };

    return (
        <AppLayout title="Compose Message">
            <Head title="Compose" />
            <div className="mx-auto max-w-2xl">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href={route('messages.index')}>
                        <ArrowLeft className="mr-1 size-4" /> Back
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>New message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-2">
                                <Label>To</Label>
                                <Select
                                    value={data.to_user || undefined}
                                    onValueChange={(v) => setData('to_user', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select recipient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recipients.map((r) => (
                                            <SelectItem key={r} value={r}>
                                                {r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.to_user} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <textarea
                                    id="message"
                                    rows={6}
                                    className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                />
                                <InputError message={errors.message} />
                            </div>
                            <div>
                                <Button type="submit" disabled={processing}>
                                    Send
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
