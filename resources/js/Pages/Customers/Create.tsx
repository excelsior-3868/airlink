import CustomerForm from '@/components/CustomerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function CustomersCreate() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    New Customer
                </h2>
            }
        >
            <Head title="New Customer" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Button asChild variant="ghost" className="mb-4">
                        <Link href={route('customers.index')}>
                            <ArrowLeft className="mr-1 size-4" /> Back
                        </Link>
                    </Button>
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CustomerForm
                                submitUrl={route('customers.store')}
                                method="post"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
