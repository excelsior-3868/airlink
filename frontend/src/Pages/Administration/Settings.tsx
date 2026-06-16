import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Settings() {
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        company_name: '',
        company_address: '',
        company_phone: '',
        invoice_note: '',
        timezone: 'UTC',
        date_format: 'Y-m-d H:i:s',
        currency_code: 'USD',
    });

    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await fetch('/api/v1/settings', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return res.json();
        }
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                company_name: settings.company_name || '',
                company_address: settings.company_address || '',
                company_phone: settings.company_phone || '',
                invoice_note: settings.invoice_note || '',
                timezone: settings.timezone || 'UTC',
                date_format: settings.date_format || 'Y-m-d H:i:s',
                currency_code: settings.currency_code || 'USD',
            });
        }
    }, [settings]);

    const mutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch('/api/v1/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ settings: data })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to save settings');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            alert('Settings saved successfully!');
        },
        onError: (err) => {
            alert(err.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (isLoading) return <AppLayout title="Settings"><p>Loading...</p></AppLayout>;

    return (
        <AppLayout title="General Settings & Localisation">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                
                {/* General Settings */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">General Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name</label>
                            <Input 
                                value={formData.company_name}
                                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <Input 
                                value={formData.company_phone}
                                onChange={e => setFormData({ ...formData, company_phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Address</label>
                            <Textarea 
                                rows={2}
                                value={formData.company_address}
                                onChange={e => setFormData({ ...formData, company_address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Invoice Note</label>
                            <Textarea 
                                rows={2}
                                value={formData.invoice_note}
                                onChange={e => setFormData({ ...formData, invoice_note: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Localisation */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Localisation</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Timezone</label>
                            <Input 
                                placeholder="e.g., Asia/Kathmandu"
                                value={formData.timezone}
                                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Format</label>
                            <Input 
                                placeholder="e.g., Y-m-d H:i:s"
                                value={formData.date_format}
                                onChange={e => setFormData({ ...formData, date_format: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Currency Code</label>
                            <Input 
                                placeholder="e.g., NPR"
                                value={formData.currency_code}
                                onChange={e => setFormData({ ...formData, currency_code: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>

            </form>
        </AppLayout>
    );
}
