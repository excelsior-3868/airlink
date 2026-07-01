import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerLayout from '@/Layouts/CustomerLayout';
import api from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface PageContent {
    title: string;
    content: string;
}

export default function CustomPage() {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        
        setLoading(true);
        api.get(`/customer/pages/${slug}`)
            .then((res) => {
                setPage(res.data);
                setLoading(false);
            })
            .catch(() => {
                toast.error('Failed to load notice board page.');
                setLoading(false);
            });
    }, [slug]);

    if (loading) {
        return (
            <CustomerLayout title="Loading page...">
                <div className="flex h-64 items-center justify-center">
                    <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin">
                            <div className="w-4 h-4 bg-primary/20 rounded-full animate-ping" />
                        </div>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    if (!page) {
        return (
            <CustomerLayout title="Page Not Found">
                <div className="text-center space-y-4 py-8">
                    <p className="text-slate-500 font-medium">The notice page you are looking for does not exist.</p>
                    <Link to="/customer/dashboard" className="no-underline inline-flex items-center justify-center btn-primary h-10 px-4 text-sm font-semibold">
                        <ArrowLeft className="size-4 mr-1.5" /> Back to Dashboard
                    </Link>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout title={page.title}>
            <div className="space-y-4 max-w-4xl mx-auto">
                <div className="mb-4">
                    <Link
                        to="/customer/dashboard"
                        className="no-underline inline-flex items-center gap-1.5 text-slate-650 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-3 py-2 border border-transparent text-sm font-semibold cursor-pointer transition-all"
                    >
                        <ArrowLeft className="size-4" /> Dashboard
                    </Link>
                </div>

                {/* Render legacy HTML safely inside GymOS surface panel */}
                <div 
                    className="prose max-w-none text-slate-700 dark:text-slate-300 surface-panel border border-border/50 rounded-[24px] p-6 sm:p-8 shadow-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: page.content }} 
                />
            </div>
        </CustomerLayout>
    );
}
