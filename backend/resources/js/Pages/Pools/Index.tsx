import CrudIndex from '@/components/CrudIndex';
import { type Paginator } from '@/components/Pagination';
import AppLayout from '@/Layouts/AppLayout';
import { type Pool } from '@/types/models';
import { Head } from '@inertiajs/react';

export default function PoolsIndex({
    pools,
    filters,
}: {
    pools: Paginator<Pool>;
    filters: { search?: string };
}) {
    return (
        <AppLayout title="IP Pools">
            <Head title="IP Pools" />
            <CrudIndex<Pool>
                rows={pools}
                routeBase="pools"
                indexRoute="pools.index"
                createLabel="New Pool"
                search={filters.search}
                deleteName={(r) => r.pool_name}
                columns={[
                    { header: 'Pool Name', cell: (r) => r.pool_name },
                    {
                        header: 'Range IP',
                        cell: (r) => <span className="font-mono text-sm">{r.range_ip}</span>,
                    },
                    { header: 'Router', cell: (r) => r.router_name },
                ]}
            />
        </AppLayout>
    );
}
