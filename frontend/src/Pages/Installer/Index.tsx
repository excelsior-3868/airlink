import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, AlertTriangle, Database, ShieldAlert, Cpu, Server, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ReqItem {
    checked: boolean;
    value: string;
    required: string;
}

interface Requirements {
    php_version: ReqItem;
    pdo_mysql: ReqItem;
    storage_writable: ReqItem;
    cache_writable: ReqItem;
}

export default function Installer() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Precheck
    const [reqs, setReqs] = useState<Requirements | null>(null);
    const [passed, setPassed] = useState(false);

    // Step 2: DB Form
    const [dbHost, setDbHost] = useState('127.0.0.1');
    const [dbPort, setDbPort] = useState('3306');
    const [dbDatabase, setDbDatabase] = useState('airlink');
    const [dbUsername, setDbUsername] = useState('root');
    const [dbPassword, setDbPassword] = useState('');

    // Step 3: Migration progress
    const [consoleLog, setConsoleLog] = useState('');

    // Step 4: Admin account form
    const [adminUser, setAdminUser] = useState('admin');
    const [adminFull, setAdminFull] = useState('Administrator');
    const [adminPass, setAdminPass] = useState('');

    const runPrecheck = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/install/precheck');
            setReqs(res.data.requirements);
            setPassed(res.data.passed);
        } catch (e: any) {
            if (e.response && e.response.status === 400) {
                toast.info('System is already configured.');
                navigate('/login');
            } else {
                toast.error('Failed to contact setup engine.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runPrecheck();
    }, []);

    const handleDatabaseConfig = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/api/v1/install/database', {
                db_host: dbHost,
                db_port: dbPort,
                db_database: dbDatabase,
                db_username: dbUsername,
                db_password: dbPassword,
            });
            toast.success('Database configuration updated.');
            setStep(3);
            runMigration();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Database connection test failed.');
        } finally {
            setLoading(false);
        }
    };

    const runMigration = async () => {
        setLoading(true);
        setConsoleLog('Starting migrations...\nInitializing connection...\n');
        
        try {
            const res = await axios.post('/api/v1/install/migrate');
            setConsoleLog((prev) => prev + res.data.output + '\nMigrations completed successfully!');
            toast.success('Migrations completed.');
            setTimeout(() => setStep(4), 1500);
        } catch (err: any) {
            setConsoleLog((prev) => prev + '\n[ERROR] Migration failed:\n' + (err.response?.data?.message || 'Unknown error.'));
            toast.error('Migrations failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e: FormEvent) => {
        e.preventDefault();
        if (adminPass.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/v1/install/admin', {
                username: adminUser,
                fullname: adminFull,
                password: adminPass,
            });
            toast.success('Admin configured successfully!');
            setStep(5);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create admin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-slate-800 border-slate-700 text-white shadow-xl">
                <CardHeader className="border-b border-slate-700">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Cpu className="text-indigo-400 size-6" /> Airlink Setup Wizard
                    </CardTitle>
                    {/* Setup steps indicators */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-3">
                        <span className={step >= 1 ? 'text-indigo-400 font-semibold' : ''}>1. Checks</span>
                        <span>&rarr;</span>
                        <span className={step >= 2 ? 'text-indigo-400 font-semibold' : ''}>2. Database</span>
                        <span>&rarr;</span>
                        <span className={step >= 3 ? 'text-indigo-400 font-semibold' : ''}>3. Migrations</span>
                        <span>&rarr;</span>
                        <span className={step >= 4 ? 'text-indigo-400 font-semibold' : ''}>4. Admin Setup</span>
                        <span>&rarr;</span>
                        <span className={step >= 5 ? 'text-indigo-400 font-semibold' : ''}>5. Done</span>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    {/* Step 1: Precheck */}
                    {step === 1 && reqs && (
                        <div className="space-y-6">
                            <h3 className="text-base font-semibold text-slate-200">System Environment Verification</h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg border border-slate-700">
                                    <span className="text-sm">PHP Version ({reqs.php_version.required})</span>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-slate-400">{reqs.php_version.value}</span>
                                        {reqs.php_version.checked ? <Check className="text-emerald-500 size-4" /> : <ShieldAlert className="text-rose-500 size-4" />}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg border border-slate-700">
                                    <span className="text-sm">PDO MySQL Extension</span>
                                    <div className="flex items-center gap-2 text-xs">
                                        {reqs.pdo_mysql.checked ? <Check className="text-emerald-500 size-4" /> : <ShieldAlert className="text-rose-500 size-4" />}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg border border-slate-700">
                                    <span className="text-sm">Storage Directory Permissions</span>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-slate-400">{reqs.storage_writable.value}</span>
                                        {reqs.storage_writable.checked ? <Check className="text-emerald-500 size-4" /> : <ShieldAlert className="text-rose-500 size-4" />}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg border border-slate-700">
                                    <span className="text-sm">Cache Directory Permissions</span>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-slate-400">{reqs.cache_writable.value}</span>
                                        {reqs.cache_writable.checked ? <Check className="text-emerald-500 size-4" /> : <ShieldAlert className="text-rose-500 size-4" />}
                                    </div>
                                </div>
                            </div>

                            {passed ? (
                                <Button onClick={() => setStep(2)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                                    Continue Setup
                                </Button>
                            ) : (
                                <div className="bg-rose-950/40 border border-rose-900 rounded-lg p-4 text-xs text-rose-300 flex gap-2">
                                    <AlertTriangle className="size-5 shrink-0 text-rose-500" />
                                    <div>
                                        Some checklist items failed. Please correct permission issues on storage and cache folders, enable extension requirements, and click Refresh.
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Database Configuration */}
                    {step === 2 && (
                        <form onSubmit={handleDatabaseConfig} className="space-y-4">
                            <h3 className="text-base font-semibold text-slate-200 flex items-center gap-1.5">
                                <Database className="size-5 text-indigo-400" /> Database Connection Parameters
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-300">Database Server Host</label>
                                    <Input
                                        className="bg-slate-700 border-slate-600 text-white"
                                        value={dbHost}
                                        onChange={(e) => setDbHost(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-300">Port</label>
                                    <Input
                                        className="bg-slate-700 border-slate-600 text-white"
                                        value={dbPort}
                                        onChange={(e) => setDbPort(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-300">Database Name</label>
                                    <Input
                                        className="bg-slate-700 border-slate-600 text-white"
                                        value={dbDatabase}
                                        onChange={(e) => setDbDatabase(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-300">User Username</label>
                                    <Input
                                        className="bg-slate-700 border-slate-600 text-white"
                                        value={dbUsername}
                                        onChange={(e) => setDbUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs text-slate-300">Password</label>
                                    <Input
                                        type="password"
                                        className="bg-slate-700 border-slate-600 text-white"
                                        value={dbPassword}
                                        onChange={(e) => setDbPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold" disabled={loading}>
                                {loading ? 'Validating Connection...' : 'Save & Test Configuration'}
                            </Button>
                        </form>
                    )}

                    {/* Step 3: Migration terminal logs */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-slate-200 flex items-center gap-1.5">
                                <Server className="size-5 text-indigo-400" /> Database Migration Execution
                            </h3>

                            <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-xs text-indigo-300 max-h-64 overflow-y-auto whitespace-pre-wrap">
                                {consoleLog}
                            </pre>

                            {loading && (
                                <div className="flex items-center gap-2 text-xs text-slate-400 justify-center py-2">
                                    <RefreshCw className="animate-spin size-4 text-indigo-400" /> Migration in progress...
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Admin Setup */}
                    {step === 4 && (
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <h3 className="text-base font-semibold text-slate-200">System Administrator Provisioning</h3>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-300">Username *</label>
                                <Input
                                    className="bg-slate-700 border-slate-600 text-white"
                                    placeholder="e.g. admin"
                                    value={adminUser}
                                    onChange={(e) => setAdminUser(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-300">Full Name *</label>
                                <Input
                                    className="bg-slate-700 border-slate-600 text-white"
                                    placeholder="e.g. System Administrator"
                                    value={adminFull}
                                    onChange={(e) => setAdminFull(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-300">Password *</label>
                                <Input
                                    type="password"
                                    className="bg-slate-700 border-slate-600 text-white"
                                    placeholder="Minimum 6 characters"
                                    value={adminPass}
                                    onChange={(e) => setAdminPass(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold" disabled={loading}>
                                {loading ? 'Provisioning Admin...' : 'Complete Installation'}
                            </Button>
                        </form>
                    )}

                    {/* Step 5: Success screen */}
                    {step === 5 && (
                        <div className="text-center space-y-6 py-6">
                            <CheckCircle className="size-16 text-emerald-500 mx-auto animate-bounce" />
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-100">Setup Completed!</h3>
                                <p className="text-sm text-slate-400">
                                    Airlink ISP Billing system is fully configured and ready.
                                </p>
                            </div>

                            <Button onClick={() => navigate('/login')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                                Go to Login Page
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
