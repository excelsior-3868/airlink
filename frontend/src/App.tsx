import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Login from '@/Pages/Auth/Login';
import Dashboard from '@/Pages/Dashboard';
import CustomersIndex from '@/Pages/Customers/Index';
import CustomersSearch from '@/Pages/Customers/Search';
import CustomersPPPoE from '@/Pages/Customers/PPPoE';
import CustomersBilling from '@/Pages/Customers/Billing';
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
import RouterIndex from '@/Pages/Routers/Index';
import RouterForm from '@/Pages/Routers/Form';
import NASLogs from '@/Pages/NAS/Logs';
import IpBindIndex from '@/Pages/IpBind/Index';
import IpBindForm from '@/Pages/IpBind/Form';
import VouchersIndex from '@/Pages/Vouchers/Index';
import VouchersGenerate from '@/Pages/Vouchers/Generate';
import VoucherAllocation from '@/Pages/Vouchers/Allocation';
import MessagesIndex from '@/Pages/Messages/Index';
import MessagesCreate from '@/Pages/Messages/Create';
import MessagesShow from '@/Pages/Messages/Show';
import ReportsIndex from '@/Pages/Reports/Index';
import BillingsDashboard from '@/Pages/Reports/Billings';
import WalletIndex from '@/Pages/Wallet/Index';
import MonitorSessions from '@/Pages/Monitor/Sessions';
import MonitorLogs from '@/Pages/Monitor/Logs';
import UsersIndex from '@/Pages/Administration/Users/Index';
import UserForm from '@/Pages/Administration/Users/Form';
import Settings from '@/Pages/Administration/Settings';
import BackupRestore from '@/Pages/Administration/Backup';
import CustomerDashboard from '@/Pages/CustomerPortal/Dashboard';
import CustomerRecharge from '@/Pages/CustomerPortal/Recharge';
import CustomerTickets from '@/Pages/CustomerPortal/Tickets';
import CustomPage from '@/Pages/CustomerPortal/CustomPage';
import TicketsIndex from '@/Pages/Tickets/Index';
import TicketDetails from '@/Pages/Tickets/Details';
import CMSCategories from '@/Pages/Administration/CMS/Categories';
import CMSStates from '@/Pages/Administration/CMS/States';
import Installer from '@/Pages/Installer/Index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/install" element={<Installer />} />
                    
                    {/* Customer Portal Routes (Protected) */}
                    <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                        <Route path="/customer/recharge" element={<CustomerRecharge />} />
                        <Route path="/customer/tickets" element={<CustomerTickets />} />
                        <Route path="/pages/:slug" element={<CustomPage />} />
                    </Route>

                    {/* All authenticated staff */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/messages" element={<MessagesIndex />} />
                        <Route path="/messages/create" element={<MessagesCreate />} />
                        <Route path="/messages/:id" element={<MessagesShow />} />
                    </Route>

                    {/* Admin, Sales & POS */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'sales', 'pos']} />}>
                        <Route path="/customers" element={<CustomersIndex />} />
                        <Route path="/customers/search" element={<CustomersSearch />} />
                        <Route path="/customers/pppoe" element={<CustomersPPPoE />} />
                        <Route path="/customers/billing" element={<CustomersBilling />} />
                        <Route path="/customers/create" element={<CustomersCreate />} />
                        <Route path="/customers/:id" element={<CustomersShow />} />
                        <Route path="/customers/:id/edit" element={<CustomersEdit />} />
                        <Route path="/customers/:id/recharge" element={<RechargeCreate />} />
                        <Route path="/vouchers" element={<VouchersIndex />} />
                        <Route path="/vouchers/generate" element={<VouchersGenerate />} />
                        <Route path="/vouchers/allocate" element={<VoucherAllocation />} />
                        <Route path="/wallet" element={<WalletIndex />} />
                    </Route>

                    {/* Sales & Admins Only (including tickets list & details) */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'sales']} />}>
                        <Route path="/reports" element={<ReportsIndex />} />
                        <Route path="/reports/billings" element={<BillingsDashboard />} />
                        <Route path="/tickets" element={<TicketsIndex />} />
                        <Route path="/tickets/:id" element={<TicketDetails />} />
                    </Route>

                    {/* Admins only */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/plans" element={<PlansIndex type="hotspot" />} />
                        <Route path="/plans/pppoe" element={<PlansIndex type="pppoe" />} />
                        <Route path="/plans/create" element={<PlanForm />} />
                        <Route path="/plans/:id/edit" element={<PlanForm />} />
                        <Route path="/bandwidth" element={<BandwidthIndex />} />
                        <Route path="/bandwidth/create" element={<BandwidthForm />} />
                        <Route path="/bandwidth/:id/edit" element={<BandwidthForm />} />
                        <Route path="/routers" element={<RouterIndex />} />
                        <Route path="/routers/create" element={<RouterForm />} />
                        <Route path="/routers/:id/edit" element={<RouterForm />} />
                        <Route path="/nas/logs" element={<NASLogs />} />
                        <Route path="/ip-bindings" element={<IpBindIndex />} />
                        <Route path="/ip-bindings/create" element={<IpBindForm />} />
                        <Route path="/ip-bindings/:id/edit" element={<IpBindForm />} />
                        <Route path="/pools" element={<PoolsIndex />} />
                        <Route path="/pools/create" element={<PoolForm />} />
                        <Route path="/pools/:id/edit" element={<PoolForm />} />
                        <Route path="/monitor/sessions" element={<MonitorSessions />} />
                        <Route path="/monitor/logs" element={<MonitorLogs />} />
                        
                        {/* Administration */}
                        <Route path="/administration/users" element={<UsersIndex />} />
                        <Route path="/administration/users/create" element={<UserForm />} />
                        <Route path="/administration/users/:id/edit" element={<UserForm />} />
                        <Route path="/administration/settings" element={<Settings />} />
                        <Route path="/administration/backup" element={<BackupRestore />} />
                        
                        {/* CMS Settings */}
                        <Route path="/administration/cms/categories" element={<CMSCategories />} />
                        <Route path="/administration/cms/states" element={<CMSStates />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
}
