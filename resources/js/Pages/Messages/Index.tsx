import Pagination, { type Paginator } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import { type Message } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { Inbox, Plus, Send } from 'lucide-react';

export default function MessagesIndex({
    messages,
    box,
}: {
    messages: Paginator<Message>;
    box: 'inbox' | 'sent';
}) {
    const go = (b: string) =>
        router.get(route('messages.index'), { box: b }, { preserveState: true });

    return (
        <AppLayout title="Messages">
            <Head title="Messages" />
            <div className="mx-auto max-w-5xl space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex gap-1 rounded-md border p-1">
                        <Button
                            size="sm"
                            variant={box === 'inbox' ? 'default' : 'ghost'}
                            onClick={() => go('inbox')}
                        >
                            <Inbox className="mr-1 size-4" /> Inbox
                        </Button>
                        <Button
                            size="sm"
                            variant={box === 'sent' ? 'default' : 'ghost'}
                            onClick={() => go('sent')}
                        >
                            <Send className="mr-1 size-4" /> Sent
                        </Button>
                    </div>
                    <Button asChild>
                        <Link href={route('messages.create')}>
                            <Plus className="mr-1 size-4" /> Compose
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{box === 'sent' ? 'To' : 'From'}</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {messages.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No messages.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {messages.data.map((m) => (
                                    <TableRow
                                        key={m.id}
                                        className={cn('cursor-pointer', !m.is_read && box === 'inbox' && 'font-semibold')}
                                        onClick={() => router.visit(route('messages.show', m.id))}
                                    >
                                        <TableCell>{box === 'sent' ? m.to_user : m.from_user}</TableCell>
                                        <TableCell>{m.title}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {m.sent_at?.replace('T', ' ').slice(0, 16)}
                                        </TableCell>
                                        <TableCell>
                                            {!m.is_read && box === 'inbox' && (
                                                <Badge>new</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Pagination
                            links={messages.links}
                            from={messages.from}
                            to={messages.to}
                            total={messages.total}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
