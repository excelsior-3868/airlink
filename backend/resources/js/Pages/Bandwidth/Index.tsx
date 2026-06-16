import CrudIndex from '@/components/CrudIndex';
import { type Paginator } from '@/components/Pagination';
import AppLayout from '@/Layouts/AppLayout';
import { type Bandwidth } from '@/types/models';
import { Head } from '@inertiajs/react';

export default function BandwidthIndex({
    bandwidths,
    filters,
}: {
    bandwidths: Paginator<Bandwidth>;
    filters: { search?: string };
}) {
    return (
        <AppLayout title="Bandwidth Plans">
            <Head title="Bandwidth" />
            <CrudIndex<Bandwidth>
                rows={bandwidths}
                routeBase="bandwidth"
                indexRoute="bandwidth.index"
                createLabel="New Bandwidth"
                search={filters.search}
                searchPlaceholder="Search by name…"
                deleteName={(r) => r.name}
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
            />
        </AppLayout>
    );
}
