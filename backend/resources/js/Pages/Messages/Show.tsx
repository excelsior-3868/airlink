import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/Layouts/AppLayout';
import { type Message } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function MessagesShow({ message }: { message: Message }) {
    const destroy = () => {
        if (confirm('Delete this message?')) {
            router.delete(route('messages.destroy', message.id));
        }
    };

    return (
        <AppLayout title="Message">
            <Head title={message.title} />
            <div className="mx-auto max-w-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <Button asChild variant="ghost">
                        <Link href={route('messages.index')}>
                            <ArrowLeft className="mr-1 size-4" /> Back
                        </Link>
                    </Button>
                    <Button variant="destructive" onClick={destroy}>
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
