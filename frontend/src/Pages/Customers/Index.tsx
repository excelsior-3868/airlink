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
import { formatADBS } from '@/utils/dateFormatter';
import { Link, useSearchParams } from 'react-router-dom';
import { Pencil, Plus, MoreHorizontal, CreditCard, Network, KeyRound, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { useRef } from 'react';
import DatePicker from '@/components/ui/date-picker';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const searchQuery = searchParams.get('search') || '';
    const statusQuery = searchParams.get('status') || '';
    const expiresBeforeQuery = searchParams.get('expires_before') || '';

    const [searchInput, setSearchInput] = useState(searchQuery);
    const [statusInput, setStatusInput] = useState(statusQuery);
    const [expiresBefore, setExpiresBefore] = useState(expiresBeforeQuery);
    const [selected, setSelected] = useState<number[]>([]);

    // Bulk Recharge Modal State
    const [showRechargeModal, setShowRechargeModal] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');

    // Change MAC Modal State
    const [showMacModal, setShowMacModal] = useState(false);
    const [macInput, setMacInput] = useState('');

    useEffect(() => {
        setSearchInput(searchQuery);
        setStatusInput(statusQuery);
        setExpiresBefore(expiresBeforeQuery);
    }, [searchQuery, statusQuery, expiresBeforeQuery]);

    // Debounce: fire search 400ms after the user stops typing
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchInput = (val: string) => {
        setSearchInput(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            applyFilters({ search: val });
        }, 400);
    };

    // Commit filters to URL — accepts overrides so instant-apply controls
    // (Status, DatePicker) can pass their fresh value without waiting for state flush.
    const applyFilters = (overrides: Record<string, string> = {}) => {
        const base: Record<string, string> = {};
        if (searchInput) base.search = searchInput;
        if (statusInput) base.status = statusInput;
        if (expiresBefore) base.expires_before = expiresBefore;
        base.page = '1';
        const next = { ...base, ...overrides };
        // Strip keys set to empty string by overrides (e.g. clearing status)
        const cleaned: Record<string, string> = {};
        Object.entries(next).forEach(([k, v]) => { if (v) cleaned[k] = v; });
        cleaned.page = '1';
        setSearchParams(cleaned);
    };

    const triggerRowMacChange = (customerId: number) => {
        setSelected([customerId]);
        setMacInput('');
        setShowMacModal(true);
    };

    const triggerRowAction = (action: 'activate' | 'deactivate' | 'disable', customerId: number) => {
        bulkMutation.mutate({ action, ids: [customerId] });
    };


    // Fetch Customers
    const { data: customersData, isLoading, isError } = useQuery<ApiPaginator<Customer>>({
        queryKey: ['customers', page, searchQuery, statusQuery, type, expiresBeforeQuery],
        queryFn: async () => {
            const res = await api.get('/customers', {
                params: {
                    page,
                    search: searchQuery || undefined,
                    status: statusQuery || undefined,
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

    const changeMacMutation = useMutation({
        mutationFn: async (macAddress: string) => {
            const customerId = selected[0];
            const res = await api.post(`/customers/${customerId}/reset-mac`, {
                mac_address: macAddress
            });
            return res.data;
        },
        onSuccess: (res) => {
            toast.success(res.message || 'MAC address updated successfully.');
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setSelected([]);
            setShowMacModal(false);
            setMacInput('');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update MAC address.');
        }
    });

    const submitMacChange: FormEventHandler = (e) => {
        e.preventDefault();
        if (!macInput) {
            toast.error('Please enter a MAC address.');
            return;
        }
        changeMacMutation.mutate(macInput);
    };

    const submitSearch: FormEventHandler = (e) => {
        e.preventDefault();
        applyFilters();
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


    return (
        <AppLayout title={type === 'pppoe' ? 'PPPoE Users' : 'User Details'}>
            <div className="mx-auto max-w-7xl space-y-5">
                {/* Top bar: Add New + filters in one row */}
                <form onSubmit={submitSearch} className="flex flex-wrap items-end gap-2">
                    {/* Add New — leftmost */}
                    <Link
                        to="/customers/create"
                        className={cn(ACTION_BTN, 'bg-[#13366e] hover:bg-[#0f2a57] shrink-0')}
                    >
                        <Plus className="size-4" /> Add New
                    </Link>

                    {/* Unified search — debounced 400ms */}
                    <Input
                        placeholder="Search by Username, Profile, Batch, POS Owner..."
                        value={searchInput}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        className="flex-1 min-w-[260px] bg-background"
                    />

                    {/* Expires Before — Calendera (auto-apply on pick) */}
                    <DatePicker
                        value={expiresBefore}
                        onChange={(v) => {
                            setExpiresBefore(v);
                            applyFilters({ expires_before: v });
                        }}
                        placeholder="Expires Before"
                        className="min-w-[160px]"
                    />

                    {/* Status (auto-apply on select) */}
                    <Select
                        value={statusInput || 'all'}
                        onValueChange={(v) => {
                            const newStatus = v === 'all' ? '' : v;
                            setStatusInput(newStatus);
                            applyFilters({ status: newStatus });
                        }}
                    >
                        <SelectTrigger className="w-32 bg-background">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="activate">activate</SelectItem>
                            <SelectItem value="deactivate">deactivate</SelectItem>
                            <SelectItem value="disable">disable</SelectItem>
                        </SelectContent>
                    </Select>
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
                                            <TableHead>Created Date</TableHead>
                                            <TableHead>POS Owner</TableHead>
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
                                                    colSpan={9}
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
                                                    {c.created_at ? formatADBS(c.created_at, 'short') : '—'}
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-700">
                                                    {c.generated_by || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={c.status === 'activate' ? 'default' : 'secondary'}>
                                                        {c.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            >
                                                                <MoreHorizontal className="size-4" />
                                                                <span className="sr-only">Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel className="text-xs font-semibold text-slate-500">Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                                <Link to={`/customers/${c.id}`}>
                                                                    <ExternalLink className="mr-2 size-4 text-slate-500" />
                                                                    <span>View Details</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                                <Link to={`/customers/${c.id}/edit`}>
                                                                    <Pencil className="mr-2 size-4 text-slate-500" />
                                                                    <span>Edit Profile</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                                <Link to={`/customers/${c.id}/edit`}>
                                                                    <KeyRound className="mr-2 size-4 text-slate-500" />
                                                                    <span>Change Password</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                                <Link to={`/customers/${c.id}/recharge`}>
                                                                    <CreditCard className="mr-2 size-4 text-slate-500" />
                                                                    <span>Recharge</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => triggerRowMacChange(c.id)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Network className="mr-2 size-4 text-slate-500" />
                                                                <span>Change MAC</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => triggerRowAction('activate', c.id)}
                                                                className="cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50/50 dark:focus:bg-emerald-950/20"
                                                            >
                                                                <CheckCircle2 className="mr-2 size-4" />
                                                                <span>Activate</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => triggerRowAction('deactivate', c.id)}
                                                                className="cursor-pointer text-amber-600 focus:text-amber-700 focus:bg-amber-50/50 dark:focus:bg-amber-950/20"
                                                            >
                                                                <XCircle className="mr-2 size-4" />
                                                                <span>Deactivate</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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

            <Dialog open={showMacModal} onOpenChange={setShowMacModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change MAC Address</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitMacChange} className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium block mb-2">New MAC Address</label>
                            <Input
                                placeholder="00:11:22:33:44:55"
                                value={macInput}
                                onChange={(e) => setMacInput(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowMacModal(false)}>Cancel</Button>
                            <Button
                                type="submit"
                                disabled={!macInput || changeMacMutation.isPending}
                            >
                                {changeMacMutation.isPending ? 'Updating...' : 'Save MAC'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
