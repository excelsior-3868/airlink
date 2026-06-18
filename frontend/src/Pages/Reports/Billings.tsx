import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Banknote } from 'lucide-react';

export default function BillingsDashboard() {
    const [year, setYear] = useState(new Date().getFullYear());

    const { data, isLoading } = useQuery({
        queryKey: ['billings', year],
        queryFn: async () => {
            const res = await fetch(`/api/v1/reports/billings?year=${year}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return res.json();
        }
    });

    return (
        <AppLayout title="Billings Dashboard">
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Top Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Company Wallet Balance
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? '...' : (data?.company_balance?.toLocaleString() || '0')}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total available balance in company wallet
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Recharges ({year})
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? '...' : 
                                    data?.graph?.reduce((sum: number, item: any) => sum + item.total, 0).toLocaleString() || '0'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Sum of all recharges in {year}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Graph */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-semibold">
                            Monthly Recharge Overview
                        </CardTitle>
                        <select 
                            value={year} 
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="p-1 border rounded"
                        >
                            <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                            <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
                        </select>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] mt-4">
                            {isLoading ? (
                                <div className="flex h-full items-center justify-center">Loading graph...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data?.graph || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            cursor={{fill: 'transparent'}}
                                            contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}}
                                        />
                                        <Bar dataKey="total" fill="#13366e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
