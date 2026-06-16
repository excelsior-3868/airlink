import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Login from '@/Pages/Auth/Login';
import Dashboard from '@/Pages/Dashboard';
import CustomersIndex from '@/Pages/Customers/Index';
import CustomersCreate from '@/Pages/Customers/Create';
import CustomersShow from '@/Pages/Customers/Show';
import CustomersEdit from '@/Pages/Customers/Edit';
import RechargeCreate from '@/Pages/Recharge/Create';
import BandwidthIndex from '@/Pages/Bandwidth/Index';
import BandwidthForm from '@/Pages/Bandwidth/Form';
import PlansIndex from '@/Pages/Plans/Index';
import PlanForm from '@/Pages/Plans/Form';
import PoolsIndex from '@/Pages/Pools/Index';
import PoolForm from '@/Pages/Pools/Form';
import RoutersIndex from '@/Pages/Routers/Index';
import RouterForm from '@/Pages/Routers/Form';
import VouchersIndex from '@/Pages/Vouchers/Index';
import VouchersGenerate from '@/Pages/Vouchers/Generate';
import MessagesIndex from '@/Pages/Messages/Index';
import MessagesCreate from '@/Pages/Messages/Create';
import MessagesShow from '@/Pages/Messages/Show';
import ReportsIndex from '@/Pages/Reports/Index';
import WalletIndex from '@/Pages/Wallet/Index';
import MonitorSessions from '@/Pages/Monitor/Sessions';
import MonitorLogs from '@/Pages/Monitor/Logs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    {/* All authenticated staff */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/messages" element={<MessagesIndex />} />
                        <Route path="/messages/create" element={<MessagesCreate />} />
                        <Route path="/messages/:id" element={<MessagesShow />} />
                    </Route>

                    {/* Sales & Admins */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'sales']} />}>
                        <Route path="/customers" element={<CustomersIndex />} />
                        <Route path="/customers/create" element={<CustomersCreate />} />
                        <Route path="/customers/:id" element={<CustomersShow />} />
                        <Route path="/customers/:id/edit" element={<CustomersEdit />} />
                        <Route path="/customers/:id/recharge" element={<RechargeCreate />} />
                        <Route path="/vouchers" element={<VouchersIndex />} />
                        <Route path="/vouchers/generate" element={<VouchersGenerate />} />
                        <Route path="/reports" element={<ReportsIndex />} />
                    </Route>

                    {/* Admins only */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/plans" element={<PlansIndex />} />
                        <Route path="/plans/create" element={<PlanForm />} />
                        <Route path="/plans/:id/edit" element={<PlanForm />} />
                        <Route path="/bandwidth" element={<BandwidthIndex />} />
                        <Route path="/bandwidth/create" element={<BandwidthForm />} />
                        <Route path="/bandwidth/:id/edit" element={<BandwidthForm />} />
                        <Route path="/routers" element={<RoutersIndex />} />
                        <Route path="/routers/create" element={<RouterForm />} />
                        <Route path="/routers/:id/edit" element={<RouterForm />} />
                        <Route path="/pools" element={<PoolsIndex />} />
                        <Route path="/pools/create" element={<PoolForm />} />
                        <Route path="/pools/:id/edit" element={<PoolForm />} />
                        <Route path="/wallet" element={<WalletIndex />} />
                        <Route path="/monitor/sessions" element={<MonitorSessions />} />
                        <Route path="/monitor/logs" element={<MonitorLogs />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
}
