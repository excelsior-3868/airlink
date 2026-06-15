import CrudIndex from '@/components/CrudIndex';
import { type Paginator } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/Layouts/AppLayout';
import { type Plan } from '@/types/models';
import { Head } from '@inertiajs/react';

export default function PlansIndex({
    plans,
    filters,
}: {
    plans: Paginator<Plan>;
    filters: { search?: string; type?: string };
}) {
    return (
        <AppLayout title="Service Plans">
            <Head title="Plans" />
            <CrudIndex<Plan>
                rows={plans}
                routeBase="plans"
                indexRoute="plans.index"
                createLabel="New Plan"
                search={filters.search}
                deleteName={(r) => r.name}
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
            />
        </AppLayout>
    );
}
