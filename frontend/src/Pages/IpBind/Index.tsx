import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import Pagination from '@/components/Pagination';

export default function IpBindIndex() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['ip-bindings', page, searchParams.get('search')],
        queryFn: async () => {
            const params = new URLSearchParams(searchParams);
            const res = await fetch(`/api/v1/ip-bindings?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return res.json();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/v1/ip-bindings/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to delete');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ip-bindings'] });
        },
        onError: (err) => {
            alert(err.message);
        }
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchParams({ search, page: '1' });
    };

    const handlePageChange = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', String(newPage));
        setSearchParams(newParams);
    };

    return (
        <AppLayout title="IP Bind">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex w-full sm:max-w-sm gap-2">
                    <Input 
                        placeholder="Search by MAC or name..." 
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
                    <Link to="/ip-bindings/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New IP Bind
                    </Link>
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow border overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">S.N.</th>
                            <th className="px-6 py-3">MAC Address</th>
                            <th className="px-6 py-3">IP Address</th>
                            <th className="px-6 py-3">Consumer Name</th>
                            <th className="px-6 py-3">NAS</th>
                            <th className="px-6 py-3">Registered By</th>
                            <th className="px-6 py-3 text-right">Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : data?.data?.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-4 text-center">No IP bindings found.</td></tr>
                        ) : (
                            data?.data?.map((binding: any, index: number) => (
                                <tr key={binding.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{index + 1 + (data.current_page - 1) * data.per_page}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{binding.mac_address}</td>
                                    <td className="px-6 py-4 font-mono">{binding.address}</td>
                                    <td className="px-6 py-4">{binding.consumer_name}</td>
                                    <td className="px-6 py-4">{binding.nas}</td>
                                    <td className="px-6 py-4">{binding.registered_by}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to={`/ip-bindings/${binding.id}/edit`}>
                                                    <Edit className="h-4 w-4 text-yellow-600" />
                                                </Link>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this IP binding?')) {
                                                        deleteMutation.mutate(binding.id);
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

                {data && (
                    <div className="p-4 border-t">
                        <Pagination
                            links={data.links}
                            from={data.from ?? 0}
                            to={data.to ?? 0}
                            total={data.total ?? 0}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
