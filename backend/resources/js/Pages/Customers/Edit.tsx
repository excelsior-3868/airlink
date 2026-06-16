import CustomerForm from '@/components/CustomerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/Layouts/AppLayout';
import { type Customer } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function CustomersEdit({ customer }: { customer: Customer }) {
    return (
        <AppLayout title="Edit Customer">
            <Head title={`Edit ${customer.username}`} />

            <div className="mx-auto max-w-3xl">
                    <Button asChild variant="ghost" className="mb-4">
                        <Link href={route('customers.show', customer.id)}>
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
                                submitUrl={route(
                                    'customers.update',
                                    customer.id,
                                )}
                                method="put"
                            />
                        </CardContent>
                    </Card>
            </div>
        </AppLayout>
    );
}
