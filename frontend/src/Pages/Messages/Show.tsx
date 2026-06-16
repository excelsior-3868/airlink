import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/Layouts/AppLayout';
import { type Message } from '@/types/models';
import api from '@/lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function MessagesShow() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: message, isLoading, isError } = useQuery<Message>({
        queryKey: ['messages', id],
        queryFn: async () => {
            const res = await api.get(`/messages/${id}`);
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/messages/${id}`);
        },
        onSuccess: () => {
            toast.success('Message deleted successfully.');
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            navigate('/messages');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete message.');
        },
    });

    const destroy = () => {
        if (confirm('Delete this message?')) {
            deleteMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <AppLayout title="Message">
                <div className="flex h-48 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    if (isError || !message) {
        return (
            <AppLayout title="Message">
                <div className="mx-auto max-w-2xl text-center space-y-4">
                    <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
                        Failed to load message.
                    </div>
                    <Button asChild variant="ghost" className="cursor-pointer">
                        <Link to="/messages">
                            <ArrowLeft className="mr-1 size-4" /> Back to Messages
                        </Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Message">
            <div className="mx-auto max-w-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <Button asChild variant="ghost" className="cursor-pointer">
                        <Link to="/messages">
                            <ArrowLeft className="mr-1 size-4" /> Back
                        </Link>
                    </Button>
                    <Button variant="destructive" onClick={destroy} disabled={deleteMutation.isPending} className="cursor-pointer">
                        <Trash2 className="mr-1 size-4" /> Delete
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>{message.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            From <span className="font-medium">{message.from_user}</span> to{' '}
                            <span className="font-medium">{message.to_user}</span> ·{' '}
                            {message.sent_at?.replace('T', ' ').slice(0, 16)}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
