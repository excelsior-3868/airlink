import CrudIndex from '@/components/CrudIndex';
import { type Paginator } from '@/components/Pagination';
import AppLayout from '@/Layouts/AppLayout';
import { type Pool } from '@/types/models';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function PoolsIndex() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';

    const { data, isLoading, isError } = useQuery<Paginator<Pool>>({
        queryKey: ['pools', page, search],
        queryFn: async () => {
            const res = await api.get('/pools', {
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
            await api.delete(`/pools/${id}`);
        },
        onSuccess: () => {
            toast.success('IP Pool deleted successfully.');
            queryClient.invalidateQueries({ queryKey: ['pools'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete IP Pool.');
        },
    });

    const handleSearch = (newSearch: string) => {
        setSearchParams({ search: newSearch, page: '1' });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ search, page: String(newPage) });
    };

    return (
        <AppLayout title="IP Pools">
            <CrudIndex<Pool>
                rows={data}
                columns={[
                    { header: 'Pool Name', cell: (r) => r.pool_name },
                    {
                        header: 'Range IP',
                        cell: (r) => <span className="font-mono text-sm">{r.range_ip}</span>,
                    },
                    { header: 'Router', cell: (r) => r.router_name },
                ]}
                routeBase="pools"
                createLabel="New Pool"
                searchPlaceholder="Search by name…"
                deleteName={(r) => r.pool_name}
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
