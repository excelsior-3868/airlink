import CrudIndex from '@/components/CrudIndex';
import { type Paginator } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/Layouts/AppLayout';
import { type Plan } from '@/types/models';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface PlansIndexProps {
    type?: 'hotspot' | 'pppoe';
}

export default function PlansIndex({ type }: PlansIndexProps) {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';

    const { data, isLoading, isError } = useQuery<Paginator<Plan>>({
        queryKey: ['plans', page, search],
        queryFn: async () => {
            const res = await api.get('/plans', {
                params: {
                    page,
                    search: search || undefined,
                    type: type || undefined,
                },
            });
            return res.data;
        },
        placeholderData: keepPreviousData,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/plans/${id}`);
        },
        onSuccess: () => {
            toast.success('Service plan deleted successfully.');
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete service plan.');
        },
    });

    const handleSearch = (newSearch: string) => {
        setSearchParams({ search: newSearch, page: '1' });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ search, page: String(newPage) });
    };

    return (
        <AppLayout title={type === 'pppoe' ? 'PPPoE Plans' : 'Service Plans'}>
            <CrudIndex<Plan>
                rows={data}
                columns={[
                    { header: 'Plan Name', cell: (r) => r.name },
                    {
                        header: 'Type',
                        cell: (r) => <Badge variant="outline">{r.type}</Badge>,
                    },
                    { header: 'Bandwidth', cell: (r) => r.bandwidth?.name ?? '—' },
                    { header: 'Price', cell: (r) => r.price ?? '—' },
                    {
                        header: 'Validity',
                        cell: (r) => `${r.validity} ${r.validity_unit ?? ''}`,
                    },
                ]}
                routeBase="plans"
                createLabel="New Plan"
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
