import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">S.N.</TableHead>
                                <TableHead>MAC Address</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Consumer Name</TableHead>
                                <TableHead>NAS</TableHead>
                                <TableHead>Registered By</TableHead>
                                <TableHead className="text-right">Manage</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    </TableCell>
                                </TableRow>
                            ) : data?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No IP bindings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data?.map((binding: any, index: number) => (
                                    <TableRow key={binding.id}>
                                        <TableCell className="text-muted-foreground">
                                            {index + 1 + (data.current_page - 1) * data.per_page}
                                        </TableCell>
                                        <TableCell className="font-medium">{binding.mac_address}</TableCell>
                                        <TableCell className="font-mono">{binding.address}</TableCell>
                                        <TableCell>{binding.consumer_name}</TableCell>
                                        <TableCell>{binding.nas}</TableCell>
                                        <TableCell>{binding.registered_by}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                                                    <Link to={`/ip-bindings/${binding.id}/edit`}>
                                                        <Edit className="h-4 w-4 text-yellow-600" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this IP binding?')) {
                                                            deleteMutation.mutate(binding.id);
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

                    {data && data.last_page > 1 && (
                        <Pagination
                            links={data.links}
                            from={data.from ?? 0}
                            to={data.to ?? 0}
                            total={data.total ?? 0}
                            onPageChange={handlePageChange}
                        />
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
