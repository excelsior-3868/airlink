import CrudIndex from '@/components/CrudIndex';
import { type Paginator } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/Layouts/AppLayout';
import { type RouterModel } from '@/types/models';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function RoutersIndex() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';

    const { data, isLoading, isError } = useQuery<Paginator<RouterModel>>({
        queryKey: ['routers', page, search],
        queryFn: async () => {
            const res = await api.get('/routers', {
                params: {
                    page,
                    search: search || undefined,
                },
            });
            return res.data;
        },
        placeholderData: keepPreviousData,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/routers/${id}`);
        },
        onSuccess: () => {
            toast.success('Router deleted successfully.');
            queryClient.invalidateQueries({ queryKey: ['routers'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete router.');
        },
    });

    const handleSearch = (newSearch: string) => {
        setSearchParams({ search: newSearch, page: '1' });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ search, page: String(newPage) });
    };

    return (
        <AppLayout title="Routers (NAS)">
            <CrudIndex<RouterModel>
                rows={data}
                columns={[
                    { header: 'Router Name', cell: (r) => r.name },
                    {
                        header: 'IP Address',
                        cell: (r) => (
                            <span className="font-mono text-sm">
                                {r.ip_address}:{r.api_port}
                                {r.use_ssl && (
                                    <Badge variant="outline" className="ml-2">
                                        SSL
                                    </Badge>
                                )}
                            </span>
                        ),
                    },
                    { header: 'Username', cell: (r) => r.username },
                    { header: 'Description', cell: (r) => r.description ?? '—' },
                ]}
                routeBase="routers"
                createLabel="New Router"
                searchPlaceholder="Search by name…"
                deleteName={(r) => r.name}
                isLoading={isLoading}
                isError={isError}
                onSearch={handleSearch}
                onDelete={(r) => deleteMutation.mutate(r.id)}
                onPageChange={handlePageChange}
                initialSearch={search}
            />
        </AppLayout>
    );
}
