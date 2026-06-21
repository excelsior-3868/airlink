import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { RefreshCw, Wallet, Calendar, ArrowRightLeft, FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface GraphItem {
    month: string;
    total: number;
}

interface BillingData {
    graph: GraphItem[];
    company_balance: number;
    year: number;
}

interface CustomerSuggestion {
    id: number;
    username: string;
    fullname: string | null;
}

export default function CustomersBilling() {
    const navigate = useNavigate();
    const [billingData, setBillingData] = useState<BillingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState<number>(0);
    // Customer search state
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<CustomerSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerSuggestion | null>(null);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch Billings Chart & Balance
        const fetchBillingDetails = async () => {
            try {
                const [billingsRes, walletRes] = await Promise.all([
                    api.get('/reports/billings'),
                    api.get('/wallet').catch(() => null)
                ]);

                if (billingsRes.data) {
                    setBillingData(billingsRes.data);
                }

                if (walletRes && walletRes.data) {
                    if (walletRes.data.role === 'seller') {
                        setBalance(walletRes.data.available_balance);
                    } else {
                        setBalance(walletRes.data.company?.balance || billingsRes.data.company_balance || 0);
                    }
                } else {
                    setBalance(billingsRes.data?.company_balance || 0);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load billings dashboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchBillingDetails();
    }, []);

    // Handle customer search suggestion queries
    useEffect(() => {
        if (searchQuery.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            try {
                const res = await api.get('/customers', {
                    params: { search: searchQuery, per_page: 15 }
                });
                if (res.data && res.data.data) {
                    setSuggestions(res.data.data.map((c: any) => ({
                        id: c.id,
                        username: c.username,
                        fullname: c.fullname
                    })));
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error(err);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    // Handle click outside suggestions dropdown to close it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSuggestion = (cust: CustomerSuggestion) => {
        setSelectedCustomer(cust);
        setSearchQuery(cust.username);
        setShowSuggestions(false);
    };

    const handleRechargeTrigger = () => {
        if (!selectedCustomer) return;
        navigate(`/customers/${selectedCustomer.id}/recharge`);
    };



    if (loading) {
        return (
            <AppLayout title="Billings">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Billings">
            <div className="mx-auto max-w-7xl space-y-6">
                
                {/* Header Section with Wallet balance */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 border rounded-xl shadow-xs">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Billings Overview</h2>
                        <p className="text-xs text-slate-500">Manage billing recharges, dates, and transactions.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-100 px-5 py-3 rounded-lg border border-slate-200">
                        <Wallet className="size-5 text-indigo-600" />
                        <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Available Balance</div>
                            <div className="text-lg font-extrabold text-slate-800">
                                {balance.toLocaleString()} /-
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Recharge Graph (Line Chart) */}
                <div className="bg-gradient-to-r from-sky-400 to-blue-600 rounded-2xl shadow-md p-6 text-white space-y-4">
                    <div>
                        <h3 className="text-lg font-bold">Monthly Recharge Graph</h3>
                        <p className="text-xs text-sky-100 font-semibold">Year {billingData?.year || new Date().getFullYear()}</p>
                    </div>
                    <div className="h-64 w-100% min-w-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={billingData?.graph || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid stroke="rgba(255, 255, 255, 0.15)" vertical={false} />
                                <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.85)" tickLine={false} style={{ fontSize: 12, fontWeight: 'bold' }} />
                                <YAxis 
                                    stroke="rgba(255, 255, 255, 0.85)" 
                                    tickLine={false} 
                                    tickFormatter={(val) => val >= 1000 ? `${val / 1000}k` : val}
                                    style={{ fontSize: 12, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#005ACC', color: '#fff', borderRadius: 8, border: 'none' }}
                                    labelStyle={{ fontWeight: 'bold' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    name="Recharge Amount"
                                    stroke="#ffffff"
                                    strokeWidth={3}
                                    dot={{ r: 5, fill: '#ffffff', stroke: '#ffffff', strokeWidth: 1 }}
                                    activeDot={{ r: 7, fill: '#00c6ff', stroke: '#ffffff', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Action Panels */}
                <div className="grid gap-6 md:grid-cols-3">
                    
                    {/* Recharge Panel */}
                    <Card className="border shadow-xs flex flex-col justify-between">
                        <CardHeader className="pb-3 border-b bg-slate-50/50">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <RefreshCw className="size-4 text-sky-500" /> Recharge
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-3 relative" ref={dropdownRef}>
                                <label className="text-xs font-semibold text-slate-600">Search Customer</label>
                                <div className="relative">
                                    <Input
                                        placeholder="Type at least 3 letters..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setSelectedCustomer(null);
                                        }}
                                        className="bg-slate-50 pr-8"
                                    />
                                    <Search className="size-4 text-slate-400 absolute right-2.5 top-3" />
                                </div>

                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute w-full top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                                        {suggestions.map((c) => (
                                            <div
                                                key={c.id}
                                                onClick={() => handleSelectSuggestion(c)}
                                                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-950 cursor-pointer"
                                            >
                                                {c.username} - {c.fullname || 'Anonymous'}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button 
                                className="w-full mt-4 bg-sky-500 hover:bg-sky-600 text-white font-bold"
                                disabled={!selectedCustomer}
                                onClick={handleRechargeTrigger}
                            >
                                <RefreshCw className="size-4 mr-2" /> Recharge Customer
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Account Panel */}
                    <Card className="border shadow-xs">
                        <CardHeader className="pb-3 border-b bg-slate-50/50">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Wallet className="size-4 text-emerald-500" /> Account
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <Button 
                                variant="outline"
                                className="w-full justify-center text-emerald-600 border-emerald-200 hover:bg-emerald-50 font-bold"
                                onClick={() => {
                                    if (selectedCustomer) {
                                        navigate(`/customers/${selectedCustomer.id}/recharge`);
                                    } else {
                                        toast.info('Please select a customer in the Recharge search panel first.');
                                    }
                                }}
                            >
                                <Calendar className="size-4 mr-2" /> Extend Date
                            </Button>
                            <Button 
                                variant="outline"
                                className="w-full justify-center text-emerald-600 border-emerald-200 hover:bg-emerald-50 font-bold"
                                onClick={() => navigate('/wallet')}
                            >
                                <ArrowRightLeft className="size-4 mr-2" /> Fund Transfer
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Report Panel */}
                    <Card className="border shadow-xs">
                        <CardHeader className="pb-3 border-b bg-slate-50/50">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="size-4 text-rose-500" /> Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <Button 
                                variant="outline"
                                className="w-full justify-center text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                                onClick={() => navigate('/reports?view=user')}
                            >
                                <FileText className="size-4 mr-2" /> User Wise
                            </Button>
                            <Button 
                                variant="outline"
                                className="w-full justify-center text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                                onClick={() => navigate('/reports?view=period')}
                            >
                                <FileText className="size-4 mr-2" /> Date Wise
                            </Button>
                        </CardContent>
                    </Card>

                </div>

            </div>
        </AppLayout>
    );
}
