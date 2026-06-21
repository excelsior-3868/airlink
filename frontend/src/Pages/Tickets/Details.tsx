import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/Layouts/AppLayout';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowLeft, Send } from 'lucide-react';
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
    complaintFile: string | null;
    regDate: string;
    status: string;
    lastUpdationDate: string;
}

interface Remark {
    id: number;
    status: string;
    remark: string;
    remarkDate: string;
}

export default function TicketDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [remarks, setRemarks] = useState<Remark[]>([]);
    
    const [replyText, setReplyText] = useState('');
    const [status, setStatus] = useState('Open');
    
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const loadTicket = async () => {
        try {
            const res = await api.get(`/complaints/${id}`);
            setComplaint(res.data);
            setRemarks(res.data.remarks || []);
            setStatus(res.data.status);
        } catch (e) {
            toast.error('Failed to load ticket details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTicket();
    }, [id]);

    const handleSendReply = async (e: FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setProcessing(true);

        try {
            await api.post(`/complaints/${id}/remarks`, {
                remark: replyText.trim(),
                status: status,
            });
            toast.success('Remark posted successfully!');
            setReplyText('');
            loadTicket();
        } catch (err) {
            toast.error('Failed to post remark.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <AppLayout title="Ticket Details">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </AppLayout>
        );
    }

    if (!complaint) {
        return (
            <AppLayout title="Ticket Details">
                <div className="text-center py-8">
                    <p className="text-slate-500">Ticket not found.</p>
                    <Button onClick={() => navigate('/tickets')} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                        Back to Complaints
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title={`Ticket Details #${complaint.complaintNumber}`}>
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header Actions */}
                <div className="flex items-center justify-between border-b pb-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/tickets')}
                        className="text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="size-4 mr-1" /> Back to registry
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-500">Registered By: {complaint.registeredBy}</span>
                        <Badge
                            className={
                                complaint.status === 'Closed'
                                    ? 'bg-slate-500 hover:bg-slate-600'
                                    : complaint.status === 'In Process'
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-emerald-500 hover:bg-emerald-600'
                            }
                        >
                            {complaint.status}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel: Customer and Ticket context */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white border rounded-xl p-5 space-y-4 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-sm border-b pb-2">Ticket Description</h3>
                            <div className="text-xs space-y-3">
                                <div>
                                    <span className="text-slate-500 block mb-0.5">Subscriber Username:</span>
                                    <strong className="text-slate-800 font-semibold">{complaint.customerusername}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">Category:</span>
                                    <div className="font-semibold text-slate-800">{complaint.category}</div>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">Sub-category:</span>
                                    <div className="font-semibold text-slate-800">{complaint.subcategory}</div>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">Complaint Type:</span>
                                    <div className="font-semibold text-slate-800">{complaint.complaintType}</div>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">NOC:</span>
                                    <div className="font-semibold text-slate-800">{complaint.noc || 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">Location/State:</span>
                                    <div className="font-semibold text-slate-800">{complaint.state}</div>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">Registered On:</span>
                                    <div className="font-semibold text-slate-800">{complaint.regDate}</div>
                                </div>
                                {complaint.complaintFile && (
                                    <div className="pt-2 border-t">
                                        <span className="text-slate-500 block mb-1">Attached Document:</span>
                                        <a
                                            href={`/storage/${complaint.complaintFile}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-indigo-600 font-semibold hover:underline"
                                        >
                                            <FileText className="size-4" /> Open File
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Conversation Timeline */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="bg-white border rounded-xl p-5 shadow-sm flex-1 flex flex-col gap-4 min-h-[350px]">
                            <h3 className="font-bold text-slate-800 text-sm border-b pb-2">Conversation History & Status Remarks</h3>
                            
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 flex-1">
                                {/* Base details */}
                                <div className="bg-slate-50 p-4 rounded-lg border shadow-xs space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                                        <span>Customer Description</span>
                                        <span>{complaint.regDate}</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium">
                                        {complaint.complaintDetails}
                                    </p>
                                </div>

                                {/* Remarks timeline */}
                                {remarks.map((r) => (
                                    <div key={r.id} className="bg-slate-50 p-4 rounded-lg border shadow-xs space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                                            <span>Update By System / Agent</span>
                                            <span>{r.remarkDate}</span>
                                        </div>
                                        <p className="text-xs text-slate-700">{r.remark}</p>
                                        <div>
                                            <Badge variant="outline" className="text-[9px] px-1 py-0 border-indigo-200 text-indigo-700 bg-indigo-50">
                                                Status: {r.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Form */}
                            <form onSubmit={handleSendReply} className="border-t pt-4 space-y-3 mt-auto">
                                <div className="flex flex-col sm:flex-row gap-3 items-end">
                                    <div className="flex-1 w-full space-y-1">
                                        <label className="text-xs font-semibold text-slate-700">Add Remark / Update Message</label>
                                        <Input
                                            placeholder="Type message to the customer..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="w-full sm:w-48 space-y-1">
                                        <label className="text-xs font-semibold text-slate-700">Toggle Status</label>
                                        <select
                                            className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Process">In Process</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 font-semibold h-10 w-full sm:w-auto px-4 flex items-center gap-1" disabled={processing}>
                                        <Send className="size-4" /> Send Update
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
