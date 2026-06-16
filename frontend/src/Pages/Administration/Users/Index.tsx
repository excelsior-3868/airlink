import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Search } from 'lucide-react';

export default function UsersIndex() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = searchParams.get('page') || '1';
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['users', page, searchParams.get('search')],
        queryFn: async () => {
            const params = new URLSearchParams(searchParams);
            const res = await fetch(`/api/v1/users?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return res.json();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/v1/users/${id}`, {
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
        onError: (err) => {
            alert(err.message);
        }
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchParams({ search, page: '1' });
    };

    return (
        <AppLayout title="Administrator Users">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex w-full sm:max-w-sm gap-2">
                    <Input 
                        placeholder="Search by username or name..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
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

            <div className="bg-white rounded-lg shadow border overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">S.N.</th>
                            <th className="px-6 py-3">Username</th>
                            <th className="px-6 py-3">Full Name</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : data?.data?.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center">No users found.</td></tr>
                        ) : (
                            data?.data?.map((user: any, index: number) => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{index + 1 + (data.current_page - 1) * data.per_page}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                                    <td className="px-6 py-4">{user.name}</td>
                                    <td className="px-6 py-4 capitalize">{user.role}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to={`/administration/users/${user.id}/edit`}>
                                                    <Edit className="h-4 w-4 text-blue-600" />
                                                </Link>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this user?')) {
                                                        deleteMutation.mutate(user.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

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
        </AppLayout>
    );
}
