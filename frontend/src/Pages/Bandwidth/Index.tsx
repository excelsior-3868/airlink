import CrudIndex from '@/components/CrudIndex';
import { type Paginator } from '@/components/Pagination';
import AppLayout from '@/Layouts/AppLayout';
import { type Bandwidth } from '@/types/models';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function BandwidthIndex() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';

    const { data, isLoading, isError } = useQuery<Paginator<Bandwidth>>({
        queryKey: ['bandwidth', page, search],
        queryFn: async () => {
            const res = await api.get('/bandwidth', {
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
            await api.delete(`/bandwidth/${id}`);
        },
        onSuccess: () => {
            toast.success('Bandwidth plan deleted successfully.');
            queryClient.invalidateQueries({ queryKey: ['bandwidth'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete bandwidth plan.');
        },
    });

    const handleSearch = (newSearch: string) => {
        setSearchParams({ search: newSearch, page: '1' });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ search, page: String(newPage) });
    };

    return (
        <AppLayout title="Bandwidth Plans">
            <CrudIndex<Bandwidth>
                rows={data}
                columns={[
                    { header: 'BW Name', cell: (r) => r.name },
                    {
                        header: 'Rate Download',
                        cell: (r) => `${r.rate_down} ${r.rate_down_unit}`,
                    },
                    {
                        header: 'Rate Upload',
                        cell: (r) => `${r.rate_up} ${r.rate_up_unit}`,
                    },
                ]}
                routeBase="bandwidth"
                createLabel="New Bandwidth"
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
