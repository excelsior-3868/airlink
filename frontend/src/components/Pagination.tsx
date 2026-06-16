import { cn } from '@/lib/utils';

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

interface PaginationProps extends Omit<Paginator<any>, 'data'> {
    onPageChange: (page: number) => void;
}

export default function Pagination({ links = [], from = 0, to = 0, total = 0, onPageChange }: PaginationProps) {
    if (!links || links.length <= 3) {
        return null;
    }

    const handleLinkClick = (url: string | null) => {
        if (!url) return;
        try {
            // Relative url string might not be absolute, so we provide fallback origin
            const absoluteUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
            const urlObj = new URL(absoluteUrl);
            const page = urlObj.searchParams.get('page');
            if (page) {
                onPageChange(parseInt(page, 10));
            }
        } catch (e) {
            console.error('Failed to parse page url:', url, e);
        }
    };

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
                        <button
                            key={i}
                            type="button"
                            onClick={() => handleLinkClick(link.url)}
                            className={cn(
                                'min-w-9 rounded-md border px-3 py-1.5 text-sm transition hover:bg-accent cursor-pointer',
                                link.active &&
                                    'border-primary bg-primary text-primary-foreground hover:bg-primary',
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={i}
                            className="min-w-9 rounded-md border px-3 py-1.5 text-sm text-muted-foreground opacity-50 select-none"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ),
                )}
            </div>
        </div>
    );
}
