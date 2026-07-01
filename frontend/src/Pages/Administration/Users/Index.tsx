import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function UsersIndex() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = searchParams.get('page') || '1';
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['users', page, searchParams.get('search')],
        queryFn: async () => {
            const params = new URLSearchParams(searchParams);
            const res = await fetch(`/api/v1/administration/users?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return res.json();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/v1/administration/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to delete');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err: any) => {
            alert(err.message);
        }
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchParams({ search, page: '1' });
    };

    return (
        <AppLayout title="User Management">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex w-full sm:max-w-sm gap-2">
                    <Input 
                        placeholder="Search by name or email..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white"
                    />
                    <Button type="submit" variant="secondary">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                </form>
                <Button asChild>
                    <Link to="/administration/users/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New User
                    </Link>
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">S.N.</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    </TableCell>
                                </TableRow>
                            ) : data?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data?.map((user: any, index: number) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="text-muted-foreground">
                                            {index + 1 + (data.current_page - 1) * data.per_page}
                                        </TableCell>
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell className="capitalize">{user.role}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                                                    <Link to={`/administration/users/${user.id}/edit`}>
                                                        <Edit className="h-4 w-4 text-blue-600" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this user?')) {
                                                            deleteMutation.mutate(user.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {data?.last_page > 1 && (
                        <div className="flex justify-center mt-6 gap-2">
                            {data.links.map((link: any, i: number) => (
                                <Button
                                    key={i}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => {
                                        if (link.url) {
                                            const url = new URL(link.url);
                                            setSearchParams(url.searchParams);
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
