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
import api from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function MessagesCreate() {
    const navigate = useNavigate();

    // Form fields state
    const [toUser, setToUser] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch message recipients
    const { data: optionsData, isLoading } = useQuery<string[]>({
        queryKey: ['messagesRecipients'],
        queryFn: async () => {
            const res = await api.get('/messages/recipients');
            // If the backend wraps it in a "recipients" field or returns list directly
            return Array.isArray(res.data) ? res.data : (res.data.recipients || []);
        },
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            return await api.post('/messages', payload);
        },
        onSuccess: () => {
            toast.success('Message sent successfully.');
            navigate('/messages');
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
            to_user: toUser,
            title,
            message,
        });
    };

    const recipients = optionsData || [];

    if (isLoading) {
        return (
            <AppLayout title="Compose Message">
                <div className="flex h-48 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Compose Message">
            <div className="mx-auto max-w-2xl">
                <Button asChild variant="ghost" className="mb-4 cursor-pointer">
                    <Link to="/messages">
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
                                    value={toUser}
                                    onValueChange={(v) => setToUser(v)}
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue placeholder="Select recipient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recipients.map((r) => (
                                            <SelectItem key={r} value={r} className="cursor-pointer">
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
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <textarea
                                    id="message"
                                    rows={6}
                                    className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <InputError message={errors.message} />
                            </div>
                            <div>
                                <Button type="submit" disabled={mutation.isPending} className="cursor-pointer">
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
