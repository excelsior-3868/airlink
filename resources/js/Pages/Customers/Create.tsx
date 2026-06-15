import CustomerForm from '@/components/CustomerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function CustomersCreate() {
    return (
        <AppLayout title="New Customer">
            <Head title="New Customer" />

            <div className="mx-auto max-w-3xl">
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
        </AppLayout>
    );
}
