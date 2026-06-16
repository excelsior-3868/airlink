import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import { type Customer, type Plan } from '@/types/models';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Pencil, Plus, Search, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { toast } from 'sonner';

// Legacy "Manage Contact" action buttons, matched to the original colours.
const ACTION_BTN =
    'inline-flex items-center gap-1.5 rounded px-3 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 cursor-pointer';

interface ApiPaginator<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta?: {
        current_page: number;
        from: number | null;
        to: number | null;
        last_page: number;
        links: any[];
        path: string;
        per_page: number;
        total: number;
    };
}

interface CustomersIndexProps {
    type?: 'hotspot' | 'pppoe';
}

export default function CustomersIndex({ type }: CustomersIndexProps) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const searchQuery = searchParams.get('search') || '';
    const searchId = searchParams.get('id') || '';
    const expiresBeforeQuery = searchParams.get('expires_before') || '';

    const [searchInput, setSearchInput] = useState(searchQuery || searchId || '');
    const [expiresBefore, setExpiresBefore] = useState(expiresBeforeQuery);
    const [selected, setSelected] = useState<number[]>([]);
    
    // Bulk Recharge Modal State
    const [showRechargeModal, setShowRechargeModal] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');

    useEffect(() => {
        setSearchInput(searchQuery || searchId || '');
        setExpiresBefore(expiresBeforeQuery);
    }, [searchQuery, searchId, expiresBeforeQuery]);

    // Fetch Customers
    const { data: customersData, isLoading, isError } = useQuery<ApiPaginator<Customer>>({
        queryKey: ['customers', page, searchQuery, searchId, type, expiresBeforeQuery],
        queryFn: async () => {
            const res = await api.get('/customers', {
                params: {
                    page,
                    search: searchQuery || undefined,
                    id: searchId || undefined,
                    type: type || undefined,
                    expires_before: expiresBeforeQuery || undefined,
                },
            });
            return res.data;
        },
        placeholderData: keepPreviousData,
    });

    // Fetch Plans for Bulk Recharge
    const { data: plansData } = useQuery<{ data: Plan[] }>({
        queryKey: ['plans', 'all'],
        queryFn: async () => {
            const res = await api.get('/recharge/plans');
            return res.data;
        },
        enabled: showRechargeModal,
    });

    const bulkMutation = useMutation({
        mutationFn: async (payload: { action: string; ids: number[] }) => {
            const res = await api.post('/customers/bulk-action', payload);
            return res.data;
        },
        onSuccess: (res) => {
            toast.success(res.message || 'Bulk action succeeded.');
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setSelected([]);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Bulk action failed.');
        },
    });

    const bulkRechargeMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/recharge/bulk', {
                customer_ids: selected,
                plan_id: parseInt(selectedPlanId),
                method: 'cash'
            });
            return res.data;
        },
        onSuccess: (res) => {
            toast.success(res.message || 'Bulk recharge succeeded.');
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setSelected([]);
            setShowRechargeModal(false);
            setSelectedPlanId('');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Bulk recharge failed.');
        }
    });

    const submitSearch: FormEventHandler = (e) => {
        e.preventDefault();
        setSearchParams({
            search: searchInput,
            expires_before: expiresBefore,
            page: '1',
        });
    };

    const submitSearchById = () => {
        setSearchParams({
            id: searchInput,
            page: '1',
        });
    };

    const toggle = (id: number) =>
        setSelected((s) =>
            s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
        );

    const toggleAll = () => {
        if (!customersData) return;
        setSelected(
            selected.length === customersData.data.length
                ? []
                : customersData.data.map((c) => c.id),
        );
    };

    const handlePageChange = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', String(newPage));
        setSearchParams(newParams);
    };

    const bulk = (action: 'activate' | 'deactivate' | 'disable') => {
        if (selected.length === 0) {
            toast.error('Select at least one customer first.');
            return;
        }
        bulkMutation.mutate({ action, ids: selected });
    };

    const handleRechargeClick = () => {
        if (selected.length === 0) {
            toast.error('Select at least one customer to recharge.');
            return;
        }
        if (selected.length === 1) {
            navigate(`/customers/${selected[0]}/recharge`);
        } else {
            setShowRechargeModal(true);
        }
    };

    const notYet = (label: string) =>
        toast.info(`${label} will be available once that module is built.`);

    return (
        <AppLayout title={type === 'pppoe' ? 'PPPoE Users' : 'Manage Customers'}>
            <div className="mx-auto max-w-7xl space-y-5">
                {/* Action bar — mirrors legacy Manage Contact */}
                <div className="flex flex-wrap gap-2">
                    <Link
                        to="/customers/create"
                        className={cn(ACTION_BTN, 'bg-[#13366e] hover:bg-[#0f2a57]')}
                    >
                        <Plus className="size-4" /> Add New
                    </Link>
                    <button
                        onClick={() => notYet('Change Password')}
                        className={cn(ACTION_BTN, 'bg-[#2f6fb0] hover:bg-[#285f99]')}
                    >
                        <Plus className="size-4" /> Change Password
                    </button>
                    <button
                        onClick={() => bulk('disable')}
                        disabled={bulkMutation.isPending}
                        className={cn(ACTION_BTN, 'bg-[#e23b3b] hover:bg-[#c93030]')}
                    >
                        <Plus className="size-4" /> Disable
                    </button>
                    <button
                        onClick={() => bulk('activate')}
                        disabled={bulkMutation.isPending}
                        className={cn(ACTION_BTN, 'bg-[#1aa3b8] hover:bg-[#158ca0]')}
                    >
                        <Plus className="size-4" /> Activate
                    </button>
                    <button
                        onClick={() => bulk('deactivate')}
                        disabled={bulkMutation.isPending}
                        className={cn(ACTION_BTN, 'bg-[#e23b3b] hover:bg-[#c93030]')}
                    >
                        <Plus className="size-4" /> Deactivate
                    </button>
                    <button
                        onClick={handleRechargeClick}
                        className={cn(ACTION_BTN, 'bg-[#2f6fb0] hover:bg-[#285f99]')}
                    >
                        <Plus className="size-4" /> Recharge {selected.length > 1 ? `(${selected.length})` : ''}
                    </button>
                    <button
                        onClick={() => notYet('Change MAC')}
                        className={cn(ACTION_BTN, 'bg-[#2e9e3f] hover:bg-[#268435]')}
                    >
                        <Plus className="size-4" /> Change MAC
                    </button>
                </div>

                {/* Search bar */}
                <form onSubmit={submitSearch} className="flex flex-wrap items-stretch gap-2">
                    <span className="flex items-center rounded bg-[#13366e] px-3 text-white">
                        <Search className="size-4" />
                    </span>
                    <Input
                        placeholder="Search by Username..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="max-w-xs bg-background"
                    />
                    <div className="flex items-center bg-background border rounded-md px-2">
                        <CalendarIcon className="size-4 text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground whitespace-nowrap mr-2">Expires Before:</span>
                        <input 
                            type="date"
                            value={expiresBefore}
                            onChange={e => setExpiresBefore(e.target.value)}
                            className="bg-transparent border-0 text-sm outline-none"
                        />
                    </div>
                    <Button type="submit" className="bg-[#13366e] hover:bg-[#0f2a57]">
                        Search
                    </Button>
                    <Button
                        type="button"
                        onClick={submitSearchById}
                        className="bg-[#2f6fb0] hover:bg-[#285f99]"
                    >
                        Search By ID
                    </Button>
                </form>

                <Card>
                    <CardContent className="pt-6">
                        {isLoading ? (
                            <div className="flex h-48 items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : isError || !customersData ? (
                            <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive text-center">
                                Failed to load customers list.
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10">
                                                <input
                                                    type="checkbox"
                                                    className="size-4 rounded border-input"
                                                    checked={
                                                        customersData.data.length > 0 &&
                                                        selected.length ===
                                                            customersData.data.length
                                                    }
                                                    onChange={toggleAll}
                                                />
                                            </TableHead>
                                            <TableHead className="w-12">S.N.</TableHead>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Profile</TableHead>
                                            <TableHead>Batch</TableHead>
                                            <TableHead>Expiration</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customersData.data.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={8}
                                                    className="text-center text-muted-foreground"
                                                >
                                                    No customers found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {customersData.data.map((c, i) => (
                                            <TableRow key={c.id}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        className="size-4 rounded border-input"
                                                        checked={selected.includes(c.id)}
                                                        onChange={() => toggle(c.id)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {(customersData.meta?.from ?? 0) + i}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {c.username}
                                                </TableCell>
                                                <TableCell>{c.profile}</TableCell>
                                                <TableCell>
                                                    {c.batch && (
                                                        <Badge variant="outline">
                                                            {c.batch}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-sm font-medium">
                                                    {c.expiration ? c.expiration.slice(0, 10) : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                                                        {c.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            asChild
                                                            size="icon"
                                                            variant="ghost"
                                                        >
                                                            <Link to={`/customers/${c.id}`}>
                                                                <Eye className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            asChild
                                                            size="icon"
                                                            variant="ghost"
                                                        >
                                                            <Link to={`/customers/${c.id}/edit`}>
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <Pagination
                                    links={customersData.meta?.links || []}
                                    from={customersData.meta?.from ?? 0}
                                    to={customersData.meta?.to ?? 0}
                                    total={customersData.meta?.total ?? 0}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showRechargeModal} onOpenChange={setShowRechargeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Recharge Users ({selected.length})</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm font-medium block mb-2">Select Plan</label>
                        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {plansData?.data?.map((p) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                        {p.name} — {p.price}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRechargeModal(false)}>Cancel</Button>
                        <Button 
                            onClick={() => bulkRechargeMutation.mutate()} 
                            disabled={!selectedPlanId || bulkRechargeMutation.isPending}
                        >
                            {bulkRechargeMutation.isPending ? 'Recharging...' : 'Confirm Bulk Recharge'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
