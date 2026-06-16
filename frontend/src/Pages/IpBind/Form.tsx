import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function IpBindForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        mac_address: '',
        address: '',
        nas: '',
        consumer_name: ''
    });

    // Fetch available routers for NAS dropdown
    const { data: routers } = useQuery({
        queryKey: ['routers'],
        queryFn: async () => {
            const res = await fetch('/api/v1/routers', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            return data.data || [];
        }
    });

    const { data: binding, isLoading } = useQuery({
        queryKey: ['ip-binding', id],
        queryFn: async () => {
            if (!isEdit) return null;
            const res = await fetch(`/api/v1/ip-bindings/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return res.json();
        },
        enabled: isEdit
    });

    useEffect(() => {
        if (binding) {
            setFormData({
                mac_address: binding.mac_address || '',
                address: binding.address || '',
                nas: binding.nas || '',
                consumer_name: binding.consumer_name || ''
            });
        }
    }, [binding]);

    const mutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const url = isEdit ? `/api/v1/ip-bindings/${id}` : '/api/v1/ip-bindings';
            const method = isEdit ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Validation failed');
            }
            return res.json();
        },
        onSuccess: () => {
            navigate('/ip-bindings');
        },
        onError: (err) => {
            alert(err.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (isEdit && isLoading) return <AppLayout title="Edit IP Bind"><p>Loading...</p></AppLayout>;

    return (
        <AppLayout title={isEdit ? 'Edit IP Bind' : 'New IP Bind'}>
            <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">MAC Address *</label>
                            <Input 
                                required
                                placeholder="00:11:22:33:44:55"
                                value={formData.mac_address}
                                onChange={e => setFormData({ ...formData, mac_address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">IP Address *</label>
                            <Input 
                                required
                                placeholder="192.168.1.10"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Router Name (NAS) *</label>
                            <Select 
                                value={formData.nas} 
                                onValueChange={val => setFormData({ ...formData, nas: val })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select router" />
                                </SelectTrigger>
                                <SelectContent>
                                    {routers?.map((r: any) => (
                                        <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                    ))}
                                    {routers?.length === 0 && (
                                        <SelectItem value="none" disabled>No routers available</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Consumer Name *</label>
                            <Input 
                                required
                                value={formData.consumer_name}
                                onChange={e => setFormData({ ...formData, consumer_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t mt-6">
                        <Button type="button" variant="outline" onClick={() => navigate('/ip-bindings')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Saving...' : 'Save IP Bind'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
