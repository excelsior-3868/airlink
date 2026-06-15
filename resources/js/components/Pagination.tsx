import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginator<T> {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
}

export default function Pagination({ links, from, to, total }: Omit<Paginator<unknown>, 'data'>) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-2 pt-4">
            <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{from ?? 0}</span>–
                <span className="font-medium">{to ?? 0}</span> of{' '}
                <span className="font-medium">{total.toLocaleString()}</span>
            </p>
            <div className="flex flex-wrap items-center gap-1">
                {links.map((link, i) =>
                    link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={cn(
                                'min-w-9 rounded-md border px-3 py-1.5 text-sm transition hover:bg-accent',
                                link.active &&
                                    'border-primary bg-primary text-primary-foreground hover:bg-primary',
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={i}
                            className="min-w-9 rounded-md border px-3 py-1.5 text-sm text-muted-foreground opacity-50"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ),
                )}
            </div>
        </div>
    );
}
