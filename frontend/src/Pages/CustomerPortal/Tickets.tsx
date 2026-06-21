import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Plus, Send, ArrowLeft, Paperclip, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
    id: number;
    categoryName: string;
    subcategories: { id: number; subcategory: string }[];
}

interface StateRegion {
    id: number;
    stateName: string;
}

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
    complaintFile: string | null;
    regDate: string;
    status: string;
    lastUpdationDate: string;
}

interface Remark {
    id: number;
    complaintNumber: number;
    status: string;
    remark: string;
    remarkDate: string;
}

export default function CustomerTickets() {
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [states, setStates] = useState<StateRegion[]>([]);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [remarks, setRemarks] = useState<Remark[]>([]);
    
    // Create form fields
    const [categoryName, setCategoryName] = useState('');
    const [subcategoryName, setSubcategoryName] = useState('');
    const [subList, setSubList] = useState<{ id: number; subcategory: string }[]>([]);
    const [complaintType, setComplaintType] = useState('Service Outage');
    const [stateName, setStateName] = useState('');
    const [details, setDetails] = useState('');
    const [file, setFile] = useState<File | null>(null);

    // Reply fields
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const loadComplaints = async () => {
        try {
            const res = await api.get('/customer/complaints');
            setComplaints(res.data.data || []);
        } catch (e) {
            toast.error('Failed to load tickets list.');
        } finally {
            setLoading(false);
        }
    };

    const loadSettings = async () => {
        try {
            const [catRes, stateRes] = await Promise.all([
                api.get('/customer/categories'),
                api.get('/customer/states'),
            ]);
            setCategories(catRes.data);
            setStates(stateRes.data);
        } catch (e) {
            console.error('Failed to load category/state configurations.');
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
        if (!categoryName || !subcategoryName || !stateName || !details.trim()) {
            toast.error('Please fill in all required fields.');
            return;
        }

        setProcessing(true);
        const formData = new FormData();
        formData.append('category', categoryName);
        formData.append('subcategory', subcategoryName);
        formData.append('complaintType', complaintType);
        formData.append('state', stateName);
        formData.append('complaintDetails', details.trim());
        if (file) {
            formData.append('file', file);
        }

        try {
            await api.post('/customer/complaints', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Complaint registered successfully!');
            setView('list');
            setDetails('');
            setFile(null);
            loadComplaints();
        } catch (err) {
            toast.error('Failed to register complaint.');
        } finally {
            setProcessing(false);
        }
    };

    const handleViewDetail = async (complaint: Complaint) => {
        setSelectedComplaint(complaint);
        setLoading(true);
        setView('detail');

        try {
            const res = await api.get(`/customer/complaints/${complaint.complaintNumber}`);
            setSelectedComplaint(res.data);
            setRemarks(res.data.remarks || []);
        } catch (e) {
            toast.error('Failed to load ticket details.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async (e: FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedComplaint) return;

        setProcessing(true);

        try {
            await api.post(`/customer/complaints/${selectedComplaint.complaintNumber}/remarks`, {
                remark: replyText.trim(),
            });
            toast.success('Reply sent!');
            setReplyText('');
            // Reload remarks
            const detailRes = await api.get(`/customer/complaints/${selectedComplaint.complaintNumber}`);
            setSelectedComplaint(detailRes.data);
            setRemarks(detailRes.data.remarks || []);
        } catch (e) {
            toast.error('Failed to send reply.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading && view !== 'detail') {
        return (
            <CustomerLayout title="Support Tickets">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout title="Support & Troubleshooting Tickets">
            {view === 'list' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 text-base">Your Tickets</h3>
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
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 px-3 flex items-center gap-1"
                        >
                            <Plus className="size-4" /> Create Ticket
                        </Button>
                    </div>

                    <div className="border rounded-xl shadow-sm overflow-hidden bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ticket #</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Registration Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {complaints.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-6">
                                            No complaints registered. If you are facing any issues, click "Create Ticket".
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    complaints.map((c) => (
                                        <TableRow key={c.complaintNumber}>
                                            <TableCell className="font-mono text-xs font-semibold text-slate-700">
                                                #{c.complaintNumber}
                                            </TableCell>
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
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetail(c)}
                                                    className="text-indigo-600 hover:text-indigo-700 font-semibold"
                                                >
                                                    <MessageSquare className="size-4 mr-1" /> Open Remarks
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
                <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('list')}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="size-4 mr-1" /> Back to list
                        </Button>
                        <h3 className="font-bold text-slate-800 text-base">File a New Complaint</h3>
                    </div>

                    <form onSubmit={handleCreateTicket} className="space-y-4 bg-slate-50 border rounded-xl p-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Location / State *</label>
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
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Complaint Details *</label>
                            <Textarea
                                rows={4}
                                placeholder="Describe the issue you are facing..."
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Attach Document / Photo (Optional)</label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="bg-white"
                                />
                                <Paperclip className="size-5 text-slate-400 shrink-0" />
                            </div>
                            <p className="text-[10px] text-slate-400">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setView('list')}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={processing}>
                                {processing ? 'Submitting...' : 'Submit Ticket'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {view === 'detail' && selectedComplaint && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setView('list');
                                setSelectedComplaint(null);
                            }}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="size-4 mr-1" /> Back to list
                        </Button>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">Ticket #{selectedComplaint.complaintNumber}</span>
                            <Badge
                                className={
                                    selectedComplaint.status === 'Closed'
                                        ? 'bg-slate-500 hover:bg-slate-600'
                                        : selectedComplaint.status === 'In Process'
                                        ? 'bg-amber-500 hover:bg-amber-600'
                                        : 'bg-emerald-500 hover:bg-emerald-600'
                                }
                            >
                                {selectedComplaint.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left column: Ticket Info Details */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-slate-50 border rounded-xl p-4 space-y-3">
                                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Ticket Info</h4>
                                <div className="text-xs space-y-2">
                                    <div>
                                        <span className="text-slate-500">Category:</span>
                                        <div className="font-semibold text-slate-800">{selectedComplaint.category}</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Sub-category:</span>
                                        <div className="font-semibold text-slate-800">{selectedComplaint.subcategory}</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Type:</span>
                                        <div className="font-semibold text-slate-800">{selectedComplaint.complaintType}</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Registered On:</span>
                                        <div className="font-semibold text-slate-800">{selectedComplaint.regDate}</div>
                                    </div>
                                    {selectedComplaint.complaintFile && (
                                        <div className="pt-2">
                                            <span className="text-slate-500 block mb-1">Attachment:</span>
                                            <a
                                                href={`/storage/${selectedComplaint.complaintFile}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline"
                                            >
                                                <FileText className="size-4" /> View File
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right column: Chat/Timeline Conversation */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            <div className="bg-slate-50 border rounded-xl p-4 flex-1 flex flex-col gap-4 min-h-[300px]">
                                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-2">Remarks History</h4>
                                
                                {/* Timeline body */}
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 flex-1">
                                    <div className="bg-white p-3 rounded-lg border shadow-xs space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                                            <span>System Log</span>
                                            <span>{selectedComplaint.regDate}</span>
                                        </div>
                                        <div className="text-xs text-slate-600">
                                            <strong>Complaint Details:</strong> {selectedComplaint.complaintDetails}
                                        </div>
                                    </div>

                                    {remarks.map((r) => (
                                        <div key={r.id} className="bg-white p-3 rounded-lg border shadow-xs space-y-1">
                                            <div className="flex justify-between items-center text-[10px] text-slate-400">
                                                <span>Update By Staff / System</span>
                                                <span>{r.remarkDate}</span>
                                            </div>
                                            <div className="text-xs text-slate-700">{r.remark}</div>
                                            <div className="pt-1">
                                                <Badge variant="outline" className="text-[9px] px-1 py-0 border-indigo-200 text-indigo-700 bg-indigo-50">
                                                    Status: {r.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Send remark form (only if ticket is not closed) */}
                                {selectedComplaint.status !== 'Closed' ? (
                                    <form onSubmit={handleSendReply} className="flex gap-2 border-t pt-3 mt-auto">
                                        <Input
                                            placeholder="Type a response/update message..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            className="bg-white flex-1"
                                            required
                                        />
                                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0" disabled={processing}>
                                            <Send className="size-4" />
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="text-center text-xs text-slate-400 border-t pt-3 mt-auto font-medium">
                                        This ticket has been resolved and closed.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
