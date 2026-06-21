import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface StateRegion {
    id: number;
    stateName: string;
    stateDescription: string;
    postingDate: string;
}

export default function CMSStates() {
    const [states, setStates] = useState<StateRegion[]>([]);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const loadStates = async () => {
        try {
            const res = await api.get('/cms/states');
            setStates(res.data);
        } catch (e) {
            toast.error('Failed to load regions database.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStates();
    }, []);

    const handleCreateState = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !desc.trim()) return;

        setProcessing(true);
        try {
            await api.post('/cms/states', {
                stateName: name.trim(),
                stateDescription: desc.trim(),
            });
            toast.success('Region created successfully!');
            setName('');
            setDesc('');
            loadStates();
        } catch (err) {
            toast.error('Failed to register region.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteState = async (id: number) => {
        if (!confirm('Are you sure you want to delete this region?')) return;

        try {
            await api.delete(`/cms/states/${id}`);
            toast.success('Region deleted successfully.');
            loadStates();
        } catch (e) {
            toast.error('Failed to delete region.');
        }
    };

    if (loading && states.length === 0) {
        return (
            <AppLayout title="CMS States">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="CMS Location/State Management">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {/* Left Panel: Create Form */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleCreateState} className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-1.5">
                            <Plus className="size-4 text-indigo-600" /> Add Region/State
                        </h3>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Region Name *</label>
                            <Input
                                placeholder="e.g. Bagmati State"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Region Description *</label>
                            <Textarea
                                placeholder="Short description of the location..."
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                rows={3}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" disabled={processing}>
                            {processing ? 'Registering...' : 'Add Region'}
                        </Button>
                    </form>
                </div>

                {/* Right Panel: List Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-slate-50 border-b px-4 py-3">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                <MapPin className="size-4 text-indigo-600" /> Configured States / Regions
                            </h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Region/State</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Added On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {states.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                                            No regions configured.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    states.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-semibold">{s.stateName}</TableCell>
                                            <TableCell>{s.stateDescription}</TableCell>
                                            <TableCell className="text-slate-500 text-xs">{s.postingDate}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteState(s.id)}
                                                    className="text-rose-600 hover:text-rose-700"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
