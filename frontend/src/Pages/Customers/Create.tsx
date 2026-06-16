import CustomerForm from '@/components/CustomerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/Layouts/AppLayout';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function CustomersCreate() {
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await api.post('/customers', payload);
            return res.data;
        },
    });

    const handleSubmit = (formData: any, setErrors: (errors: any) => void) => {
        mutation.mutate(formData, {
            onSuccess: (data) => {
                toast.success(data.message || 'Customer created successfully.');
                navigate(`/customers/${data.customer.id}`);
            },
            onError: (err: any) => {
                if (err.response?.status === 422 && err.response?.data?.errors) {
                    setErrors(err.response.data.errors);
                } else {
                    toast.error(err.response?.data?.message || 'Failed to create customer.');
                }
            },
        });
    };

    return (
        <AppLayout title="New Customer">
            <div className="mx-auto max-w-3xl">
                <Button asChild variant="ghost" className="mb-4">
                    <Link to="/customers">
                        <ArrowLeft className="mr-1 size-4" /> Back
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Customer details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomerForm
                            onSubmit={handleSubmit}
                            processing={mutation.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
