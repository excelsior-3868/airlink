import CrudIndex from '@/components/CrudIndex';
import { type Paginator } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/Layouts/AppLayout';
import { type RouterModel } from '@/types/models';
import { Head } from '@inertiajs/react';

export default function RoutersIndex({
    routers,
    filters,
}: {
    routers: Paginator<RouterModel>;
    filters: { search?: string };
}) {
    return (
        <AppLayout title="Routers (NAS)">
            <Head title="Routers" />
            <CrudIndex<RouterModel>
                rows={routers}
                routeBase="routers"
                indexRoute="routers.index"
                createLabel="New Router"
                search={filters.search}
                deleteName={(r) => r.name}
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
                    { header: 'Description', cell: (r) => r.description },
                ]}
            />
        </AppLayout>
    );
}
