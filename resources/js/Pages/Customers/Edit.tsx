import CustomerForm from '@/components/CustomerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { type Customer } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function CustomersEdit({ customer }: { customer: Customer }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Edit Customer
                </h2>
            }
        >
            <Head title={`Edit ${customer.username}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            </div>
        </AuthenticatedLayout>
    );
}
