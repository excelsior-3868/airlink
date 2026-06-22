import Pagination from '@/components/Pagination';
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
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Users as UsersIcon, Hourglass, Eye, Pencil, MoreHorizontal, CreditCard, Network, KeyRound } from 'lucide-react';
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

const TABS = [
    { label: 'ALL', value: 'all', color: 'text-slate-800 border-slate-800' },
    { label: 'EXPIRING (1 DAY)', value: '1', color: 'text-amber-500 border-amber-500' },
    { label: 'EXPIRING (3 DAYS)', value: '3', color: 'text-cyan-500 border-cyan-500' },
    { label: 'EXPIRING (1 WEEK)', value: '7', color: 'text-blue-500 border-blue-500' },
    { label: 'EXPIRING (2 WEEKS)', value: '14', color: 'text-emerald-500 border-emerald-500' },
    { label: 'EXPIRING (30 DAYS)', value: '30', color: 'text-purple-500 border-purple-500' },
    { label: 'EXPIRED', value: 'expired', color: 'text-rose-500 border-rose-500' },
];

export default function CustomersPPPoE() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const searchQuery = searchParams.get('search') || '';
    const searchId = searchParams.get('id') || '';
    const activeTab = searchParams.get('expiry_range') || 'all';

    const [searchInput, setSearchInput] = useState(searchQuery || searchId || '');
    const [selected, setSelected] = useState<number[]>([]);
    
    // Bulk Recharge Modal State
    const [showRechargeModal, setShowRechargeModal] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');

    // Change MAC Modal State
    const [showMacModal, setShowMacModal] = useState(false);
    const [macInput, setMacInput] = useState('');

    useEffect(() => {
        setSearchInput(searchQuery || searchId || '');
    }, [searchQuery, searchId]);

    const triggerRowMacChange = (customerId: number) => {
        setSelected([customerId]);
        setMacInput('');
        setShowMacModal(true);
    };

    const triggerRowAction = (action: 'activate' | 'deactivate' | 'disable', customerId: number) => {
        bulkMutation.mutate({ action, ids: [customerId] });
    };


    // Fetch Customers (filtered by type=pppoe and activeTab range)
    const { data: customersData, isLoading, isError } = useQuery<ApiPaginator<Customer>>({
        queryKey: ['customers-pppoe', page, searchQuery, searchId, activeTab],
        queryFn: async () => {
            const res = await api.get('/customers', {
                params: {
                    page,
                    type: 'PPPOE',
                    search: searchQuery || undefined,
                    id: searchId || undefined,
                    expiry_range: activeTab !== 'all' ? activeTab : undefined,
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
            queryClient.invalidateQueries({ queryKey: ['customers-pppoe'] });
            setSelected([]);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Bulk action failed.');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.delete(`/customers/${id}`);
            return res.data;
        },
        onSuccess: (res) => {
            toast.success(res.message || 'Customer deleted successfully.');
            queryClient.invalidateQueries({ queryKey: ['customers-pppoe'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete customer.');
        }
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
            queryClient.invalidateQueries({ queryKey: ['customers-pppoe'] });
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
            queryClient.invalidateQueries({ queryKey: ['customers-pppoe'] });
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
        setSearchParams({
            search: searchInput,
            expiry_range: activeTab,
            page: '1',
        });
    };

    const submitSearchById = () => {
        setSearchParams({
            id: searchInput,
            expiry_range: activeTab,
            page: '1',
        });
    };

    const handleTabChange = (val: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('expiry_range', val);
        newParams.set('page', '1');
        setSearchParams(newParams);
        setSelected([]);
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

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this customer account?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <AppLayout title="PPPoE Users">
            <div className="mx-auto max-w-7xl space-y-5">
                {/* Action bar — only Add New */}
                <div className="flex">
                    <Link
                        to="/customers/create"
                        className={cn(ACTION_BTN, 'bg-[#13366e] hover:bg-[#0f2a57]')}
                    >
                        Add New
                    </Link>
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

                {/* Range Filter Tabs */}
                <div className="flex border rounded-lg bg-slate-50/60 p-1 flex-wrap gap-1">
                    {TABS.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => handleTabChange(t.value)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold transition-all cursor-pointer',
                                activeTab === t.value
                                    ? 'bg-white shadow-xs border-b-2 ' + t.color
                                    : 'text-slate-500 hover:bg-slate-100'
                            )}
                        >
                            {t.value === 'all' ? (
                                <UsersIcon className="size-3.5" />
                            ) : (
                                <Hourglass className="size-3.5" />
                            )}
                            {t.label}
                        </button>
                    ))}
                </div>

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
                                            <TableHead>Full Name</TableHead>
                                            <TableHead>Mobile</TableHead>
                                            <TableHead>Expire On</TableHead>
                                            <TableHead className="text-right">
                                                Action
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
                                                <TableCell className="font-semibold">
                                                    {c.username}
                                                </TableCell>
                                                <TableCell>{c.profile}</TableCell>
                                                <TableCell>{c.fullname || '—'}</TableCell>
                                                <TableCell>{c.phonenumber || '—'}</TableCell>
                                                <TableCell className="whitespace-nowrap text-sm font-semibold text-slate-700">
                                                    {c.expiration ? c.expiration.slice(0, 19).replace('T', ' ') : 'N/A'}
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
                                                                    <Eye className="mr-2 size-4 text-slate-500" />
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
                                                                <span>Activate</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => triggerRowAction('deactivate', c.id)}
                                                                className="cursor-pointer text-amber-600 focus:text-amber-700 focus:bg-amber-50/50 dark:focus:bg-amber-950/20"
                                                            >
                                                                <span>Deactivate</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => triggerRowAction('disable', c.id)}
                                                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5"
                                                            >
                                                                <span>Disable</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDelete(c.id)}
                                                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5 font-semibold"
                                                            >
                                                                <span>Delete Account</span>
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
