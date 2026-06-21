import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, RefreshCw, ArrowLeft, Search, Eye, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Complaint {
    complaintNumber: number;
    customerusername: string;
    registeredBy: string;
    category: string;
    subcategory: string;
    complaintType: string;
    state: string;
    noc: string;
    complaintDetails: string;
    regDate: string;
    status: string;
}

interface Category {
    id: number;
    categoryName: string;
    subcategories: { id: number; subcategory: string }[];
}

interface StateRegion {
    id: number;
    stateName: string;
}

export default function TicketsIndex() {
    const navigate = useNavigate();
    const [view, setView] = useState<'list' | 'create'>('list');
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [states, setStates] = useState<StateRegion[]>([]);

    // Search / Filter states
    const [searchUser, setSearchUser] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Create form states
    const [clientUsername, setClientUsername] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [subcategoryName, setSubcategoryName] = useState('');
    const [subList, setSubList] = useState<{ id: number; subcategory: string }[]>([]);
    const [complaintType, setComplaintType] = useState('Service Outage');
    const [stateName, setStateName] = useState('');
    const [details, setDetails] = useState('');
    const [nocNotes, setNocNotes] = useState('');

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const loadComplaints = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (searchUser.trim()) params.username = searchUser.trim();
            if (filterStatus) params.status = filterStatus;
            if (filterCategory) params.category = filterCategory;

            const res = await api.get('/complaints', { params });
            setComplaints(res.data.data || []);
        } catch (e) {
            toast.error('Failed to load complaints registry.');
        } finally {
            setLoading(false);
        }
    };

    const loadSettings = async () => {
        try {
            const [catRes, stateRes] = await Promise.all([
                api.get('/cms/categories'),
                api.get('/cms/states'),
            ]);
            setCategories(catRes.data);
            setStates(stateRes.data);
        } catch (e) {
            console.error('Failed to load configurations.');
        }
    };

    useEffect(() => {
        loadComplaints();
        loadSettings();
    }, []);

    const handleCategoryChange = (name: string) => {
        setCategoryName(name);
        const match = categories.find((c) => c.categoryName === name);
        if (match) {
            setSubList(match.subcategories);
            setSubcategoryName(match.subcategories[0]?.subcategory || '');
        } else {
            setSubList([]);
            setSubcategoryName('');
        }
    };

    const handleCreateTicket = async (e: FormEvent) => {
        e.preventDefault();
        if (!clientUsername.trim() || !categoryName || !subcategoryName || !stateName || !details.trim()) {
            toast.error('All fields are required.');
            return;
        }

        setProcessing(true);

        try {
            await api.post('/complaints', {
                customerusername: clientUsername.trim(),
                category: categoryName,
                subcategory: subcategoryName,
                complaintType: complaintType,
                state: stateName,
                complaintDetails: details.trim(),
                noc: nocNotes.trim(),
            });
            toast.success('Ticket registered successfully!');
            setView('list');
            setClientUsername('');
            setDetails('');
            setNocNotes('');
            loadComplaints();
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Failed to create ticket. Verify subscriber username.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        loadComplaints();
    };

    return (
        <AppLayout title="Complaints Board & Ticketing">
            {view === 'list' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Complaints Database</h2>
                            <p className="text-xs text-slate-500">Monitor, reply to, and resolve subscriber network complaints.</p>
                        </div>
                        <Button
                            onClick={() => {
                                setView('create');
                                if (categories.length > 0) {
                                    handleCategoryChange(categories[0].categoryName);
                                }
                                if (states.length > 0) {
                                    setStateName(states[0].stateName);
                                }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shrink-0"
                        >
                            <Plus className="size-4" /> Register Ticket
                        </Button>
                    </div>

                    {/* Filter bar */}
                    <form onSubmit={handleSearch} className="bg-white border rounded-lg p-4 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                <Search className="size-3 text-slate-400" /> Subscriber Username
                            </label>
                            <Input
                                placeholder="Search username..."
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Status</label>
                            <select
                                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Open">Open</option>
                                <option value="In Process">In Process</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Category</label>
                            <select
                                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.categoryName}>
                                        {c.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-900 text-white">
                                <Filter className="size-4 mr-1" /> Filter
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSearchUser('');
                                    setFilterStatus('');
                                    setFilterCategory('');
                                    setTimeout(() => loadComplaints(), 50);
                                }}
                            >
                                <RefreshCw className="size-4" />
                            </Button>
                        </div>
                    </form>

                    {/* Table View */}
                    <div className="border rounded-xl shadow-sm overflow-hidden bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ticket #</TableHead>
                                    <TableHead>Subscriber</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Complaint Type</TableHead>
                                    <TableHead>Date Filed</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                            Loading complaints registry...
                                        </TableCell>
                                    </TableRow>
                                ) : complaints.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                            No complaints match the filter parameters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    complaints.map((c) => (
                                        <TableRow key={c.complaintNumber}>
                                            <TableCell className="font-mono text-xs font-semibold text-slate-700">
                                                #{c.complaintNumber}
                                            </TableCell>
                                            <TableCell className="font-semibold">{c.customerusername}</TableCell>
                                            <TableCell>{c.category}</TableCell>
                                            <TableCell>{c.complaintType}</TableCell>
                                            <TableCell>{c.regDate}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        c.status === 'Closed'
                                                            ? 'bg-slate-500 hover:bg-slate-600'
                                                            : c.status === 'In Process'
                                                            ? 'bg-amber-500 hover:bg-amber-600'
                                                            : 'bg-emerald-500 hover:bg-emerald-600'
                                                    }
                                                >
                                                    {c.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => navigate(`/tickets/${c.complaintNumber}`)}
                                                    className="text-indigo-600 hover:text-indigo-700 font-semibold"
                                                >
                                                    <Eye className="size-4 mr-1" /> View & Reply
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {view === 'create' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('list')}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="size-4 mr-1" /> Back to list
                        </Button>
                        <h2 className="text-lg font-bold text-slate-800">Register Customer Complaint</h2>
                    </div>

                    <form onSubmit={handleCreateTicket} className="space-y-4 bg-white border rounded-xl p-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Subscriber Username *</label>
                                <Input
                                    placeholder="Enter username (e.g. subin)"
                                    value={clientUsername}
                                    onChange={(e) => setClientUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">State / Region *</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                                    value={stateName}
                                    onChange={(e) => setStateName(e.target.value)}
                                >
                                    {states.map((s) => (
                                        <option key={s.id} value={s.stateName}>
                                            {s.stateName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Category *</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                                    value={categoryName}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.categoryName}>
                                            {c.categoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Sub-category *</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                                    value={subcategoryName}
                                    onChange={(e) => setSubcategoryName(e.target.value)}
                                    disabled={subList.length === 0}
                                >
                                    {subList.map((s) => (
                                        <option key={s.id} value={s.subcategory}>
                                            {s.subcategory}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Complaint Type *</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                                    value={complaintType}
                                    onChange={(e) => setComplaintType(e.target.value)}
                                >
                                    <option value="Service Outage">Service Outage</option>
                                    <option value="Slow Connection">Slow Connection</option>
                                    <option value="Billing Dispute">Billing Dispute</option>
                                    <option value="Router / Hardware Fault">Router / Hardware Fault</option>
                                    <option value="Other / General Inquiry">Other / General Inquiry</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">NOC Notes (Internal Reference)</label>
                            <Input
                                placeholder="NOC reference number or short details..."
                                value={nocNotes}
                                onChange={(e) => setNocNotes(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Complaint Details *</label>
                            <Textarea
                                rows={4}
                                placeholder="Describe the issue reported by the subscriber..."
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setView('list')}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" disabled={processing}>
                                {processing ? 'Registering...' : 'Submit Ticket'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </AppLayout>
    );
}
