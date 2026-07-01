import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import api from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Plus, Send, ArrowLeft, Paperclip, FileText, Calendar, Tag, MapPin, Layers } from 'lucide-react';
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
                    <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin">
                            <div className="w-4 h-4 bg-primary/20 rounded-full animate-ping" />
                        </div>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout title="Support & Troubleshooting Tickets">
            {view === 'list' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-heading font-bold text-slate-800 dark:text-slate-100 text-lg">Your Tickets</h3>
                        <button
                            onClick={() => {
                                setView('create');
                                if (categories.length > 0) {
                                    handleCategoryChange(categories[0].categoryName);
                                }
                                if (states.length > 0) {
                                    setStateName(states[0].stateName);
                                }
                            }}
                            className="btn-primary h-10 px-4 text-sm font-semibold"
                        >
                            <Plus className="size-4" /> Create Ticket
                        </button>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-0 hover:bg-transparent">
                                    <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Ticket #</TableHead>
                                    <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Category</TableHead>
                                    <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Type</TableHead>
                                    <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Registration Date</TableHead>
                                    <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">Status</TableHead>
                                    <TableHead className="px-6 py-3 font-semibold text-xs tracking-wider uppercase text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {complaints.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-8 text-sm font-medium">
                                            No complaints registered. If you are facing any issues, click "Create Ticket".
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    complaints.map((c) => (
                                        <TableRow key={c.complaintNumber} className="border-b border-border/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                            <TableCell className="px-6 py-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-400">
                                                #{c.complaintNumber}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{c.category}</TableCell>
                                            <TableCell className="px-6 py-4 font-medium text-slate-700 dark:text-slate-355">{c.complaintType}</TableCell>
                                            <TableCell className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm font-medium">{c.regDate}</TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span
                                                    className={`pill font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 ${
                                                        c.status === 'Closed'
                                                            ? 'secondary'
                                                            : c.status === 'In Process'
                                                            ? 'warning'
                                                            : 'success'
                                                    }`}
                                                >
                                                    {c.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleViewDetail(c)}
                                                    className="inline-flex items-center gap-1.5 text-primary hover:bg-primary/5 rounded-xl px-3 py-1.5 border border-transparent font-semibold text-sm cursor-pointer transition-all active:scale-95"
                                                >
                                                    <MessageSquare className="size-4" /> Open Remarks
                                                </button>
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
                        <button
                            onClick={() => setView('list')}
                            className="inline-flex items-center gap-1 text-slate-650 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-3 py-2 border border-transparent text-sm font-semibold cursor-pointer transition-all"
                        >
                            <ArrowLeft className="size-4" /> Back to list
                        </button>
                        <h3 className="font-heading font-bold text-slate-800 dark:text-slate-100 text-lg">File a New Complaint</h3>
                    </div>

                    <form onSubmit={handleCreateTicket} className="space-y-5 surface-panel p-6 border border-border/50 rounded-[24px] shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Category *</label>
                                <select
                                    className="w-full input-field py-2.5 text-sm bg-white dark:bg-slate-900 cursor-pointer"
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

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Sub-category *</label>
                                <select
                                    className="w-full input-field py-2.5 text-sm bg-white dark:bg-slate-900 cursor-pointer"
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

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Complaint Type *</label>
                                <select
                                    className="w-full input-field py-2.5 text-sm bg-white dark:bg-slate-900 cursor-pointer"
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

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Location / State *</label>
                                <select
                                    className="w-full input-field py-2.5 text-sm bg-white dark:bg-slate-900 cursor-pointer"
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

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Complaint Details *</label>
                            <textarea
                                rows={4}
                                placeholder="Describe the issue you are facing..."
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                className="w-full input-field p-3 text-sm bg-white dark:bg-slate-900"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Attach Document / Photo (Optional)</label>
                            <div className="flex items-center gap-2 relative">
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="input-field py-2 text-sm bg-white dark:bg-slate-900 pr-12 cursor-pointer"
                                />
                                <Paperclip className="absolute right-4 size-5 text-slate-400 pointer-events-none" />
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold pl-1">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                className="btn-primary bg-slate-100 hover:bg-slate-200 text-slate-800 border-none h-11 px-6 text-sm font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary h-11 px-6 text-sm font-semibold"
                                disabled={processing}
                            >
                                {processing ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {view === 'detail' && selectedComplaint && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3 border-border/50">
                        <button
                            onClick={() => {
                                setView('list');
                                setSelectedComplaint(null);
                            }}
                            className="inline-flex items-center gap-1 text-slate-650 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-3 py-2 border border-transparent text-sm font-semibold cursor-pointer transition-all"
                        >
                            <ArrowLeft className="size-4" /> Back to list
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="font-heading font-bold text-slate-800 dark:text-slate-150 text-base">Ticket #{selectedComplaint.complaintNumber}</span>
                            <span
                                className={`pill font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 ${
                                    selectedComplaint.status === 'Closed'
                                        ? 'secondary'
                                        : selectedComplaint.status === 'In Process'
                                        ? 'warning'
                                        : 'success'
                                }`}
                            >
                                {selectedComplaint.status}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left column: Ticket Info Details */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="glass-card p-5 space-y-4">
                                <h4 className="font-heading font-bold text-primary dark:text-white text-sm border-b border-border/50 pb-2">Ticket Info</h4>
                                <div className="text-xs space-y-3">
                                    <div className="flex items-start gap-2.5">
                                        <Layers className="size-4 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Category / Sub-category</span>
                                            <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedComplaint.category}</div>
                                            <div className="text-slate-500 font-semibold mt-0.5 text-[11px]">{selectedComplaint.subcategory}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-2.5">
                                        <Tag className="size-4 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Type</span>
                                            <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedComplaint.complaintType}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="size-4 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">State / Location</span>
                                            <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedComplaint.state}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <Calendar className="size-4 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Registered On</span>
                                            <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedComplaint.regDate}</div>
                                        </div>
                                    </div>

                                    {selectedComplaint.complaintFile && (
                                        <div className="pt-2 border-t border-border/50">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">Attachment</span>
                                            <a
                                                href={`/storage/${selectedComplaint.complaintFile}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-primary font-bold hover:underline"
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
                            <div className="surface-panel border border-border/50 rounded-[24px] p-5 flex flex-col gap-4 min-h-[350px]">
                                <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 text-sm border-b border-border/50 pb-2">Remarks History</h4>
                                
                                {/* Timeline body */}
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 flex-1 scrollbar-thin">
                                    <div className="bg-white/60 dark:bg-slate-900/50 p-4 rounded-[18px] border border-border/55 shadow-xs space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            <span>System Log</span>
                                            <span>{selectedComplaint.regDate}</span>
                                        </div>
                                        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                            <strong className="text-primary block mb-1">Complaint Details:</strong> {selectedComplaint.complaintDetails}
                                        </div>
                                    </div>

                                    {remarks.map((r) => (
                                        <div key={r.id} className="bg-white/60 dark:bg-slate-900/50 p-4 rounded-[18px] border border-border/55 shadow-xs space-y-2">
                                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                <span>Update By Staff / System</span>
                                                <span>{r.remarkDate}</span>
                                            </div>
                                            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{r.remark}</div>
                                            <div className="pt-1.5 border-t border-border/30">
                                                <span className="pill warning text-[9px] px-1.5 py-0">
                                                    Status: {r.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Send remark form (only if ticket is not closed) */}
                                {selectedComplaint.status !== 'Closed' ? (
                                    <form onSubmit={handleSendReply} className="flex gap-2 border-t border-border/50 pt-4 mt-auto">
                                        <input
                                            placeholder="Type a response/update message..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            className="input-field flex-1 h-11 bg-white dark:bg-slate-900"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="btn-primary h-11 w-11 p-0 flex items-center justify-center shrink-0"
                                            disabled={processing}
                                        >
                                            <Send className="size-4" />
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center text-xs text-slate-400 border-t border-border/50 pt-4 mt-auto font-semibold">
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
