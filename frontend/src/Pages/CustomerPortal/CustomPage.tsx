import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerLayout from '@/Layouts/CustomerLayout';
import api from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </CustomerLayout>
        );
    }

    if (!page) {
        return (
            <CustomerLayout title="Page Not Found">
                <div className="text-center space-y-4 py-8">
                    <p className="text-slate-500">The notice page you are looking for does not exist.</p>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Link to="/customer/dashboard">
                            <ArrowLeft className="size-4 mr-1" /> Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout title={page.title}>
            <div className="space-y-4 max-w-4xl mx-auto">
                <div className="mb-4">
                    <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        <Link to="/customer/dashboard">
                            <ArrowLeft className="size-4 mr-1" /> Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Render legacy HTML safely */}
                <div 
                    className="prose max-w-none text-slate-700 bg-slate-50 border rounded-xl p-6 shadow-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: page.content }} 
                />
            </div>
        </CustomerLayout>
    );
}
