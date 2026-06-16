import CustomerForm from '@/components/CustomerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/Layouts/AppLayout';
import { type Customer } from '@/types/models';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function CustomersEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery<{ customer: Customer }>({
        queryKey: ['customer', id],
        queryFn: async () => {
            const res = await api.get(`/customers/${id}`);
            return res.data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await api.put(`/customers/${id}`, payload);
            return res.data;
        },
    });

    const handleSubmit = (formData: any, setErrors: (errors: any) => void) => {
        mutation.mutate(formData, {
            onSuccess: (data) => {
                toast.success(data.message || 'Customer updated successfully.');
                queryClient.invalidateQueries({ queryKey: ['customer', id] });
                queryClient.invalidateQueries({ queryKey: ['customers'] });
                navigate(`/customers/${id}`);
            },
            onError: (err: any) => {
                if (err.response?.status === 422 && err.response?.data?.errors) {
                    setErrors(err.response.data.errors);
                } else {
                    toast.error(err.response?.data?.message || 'Failed to update customer.');
                }
            },
        });
    };

    if (isLoading) {
        return (
            <AppLayout title="Edit Customer">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    if (isError || !data?.customer) {
        return (
            <AppLayout title="Edit Customer">
                <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive text-center">
                    Failed to load customer details.
                </div>
            </AppLayout>
        );
    }

    const customer = data.customer;

    return (
        <AppLayout title="Edit Customer">
            <div className="mx-auto max-w-3xl">
                <Button asChild variant="ghost" className="mb-4">
                    <Link to={`/customers/${id}`}>
                        <ArrowLeft className="mr-1 size-4" /> Back
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>{customer.username}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomerForm
                            customer={customer}
                            onSubmit={handleSubmit}
                            processing={mutation.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
