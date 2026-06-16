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
import api from '@/lib/api';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Inbox, Plus, Send } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

export default function MessagesIndex() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const box = (searchParams.get('box') || 'inbox') as 'inbox' | 'sent';

    const { data: messagesData, isLoading, isError } = useQuery<Paginator<Message>>({
        queryKey: ['messages', page, box],
        queryFn: async () => {
            const res = await api.get('/messages', {
                params: {
                    page,
                    box,
                },
            });
            return res.data;
        },
        placeholderData: keepPreviousData,
    });

    const setBox = (newBox: 'inbox' | 'sent') => {
        setSearchParams({ box: newBox, page: '1' });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ box, page: String(newPage) });
    };

    return (
        <AppLayout title="Messages">
            <div className="mx-auto max-w-5xl space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex gap-1 rounded-md border p-1">
                        <Button
                            size="sm"
                            variant={box === 'inbox' ? 'default' : 'ghost'}
                            onClick={() => setBox('inbox')}
                            className="cursor-pointer"
                        >
                            <Inbox className="mr-1 size-4" /> Inbox
                        </Button>
                        <Button
                            size="sm"
                            variant={box === 'sent' ? 'default' : 'ghost'}
                            onClick={() => setBox('sent')}
                            className="cursor-pointer"
                        >
                            <Send className="mr-1 size-4" /> Sent
                        </Button>
                    </div>
                    <Button asChild className="cursor-pointer">
                        <Link to="/messages/create">
                            <Plus className="mr-1 size-4" /> Compose
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        {isLoading ? (
                            <div className="flex h-48 items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : isError || !messagesData ? (
                            <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive text-center">
                                Failed to load messages.
                            </div>
                        ) : (
                            <>
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
                                        {messagesData.data.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    No messages.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {messagesData.data.map((m) => (
                                            <TableRow
                                                key={m.id}
                                                className={cn('cursor-pointer', !m.is_read && box === 'inbox' && 'font-semibold')}
                                                onClick={() => navigate(`/messages/${m.id}`)}
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
                                    links={messagesData.links}
                                    from={messagesData.from}
                                    to={messagesData.to}
                                    total={messagesData.total}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
