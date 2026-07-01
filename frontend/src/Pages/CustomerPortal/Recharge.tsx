import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '@/Layouts/CustomerLayout';
import api from '@/lib/api';
import { toast } from 'sonner';
import { AlertTriangle, Key } from 'lucide-react';

export default function CustomerRecharge() {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!code.trim()) {
            toast.error('Please enter a voucher code.');
            return;
        }

        setProcessing(true);

        try {
            const res = await api.post('/customer/recharge', { code: code.trim().toUpperCase() });
            toast.success(res.data.message || 'Account recharged successfully!');
            setCode('');
            // Redirect back to dashboard to see active status
            navigate('/customer/dashboard');
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(err.response.data.message);
            } else if (err.response && err.response.data && err.response.data.errors && err.response.data.errors.code) {
                toast.error(err.response.data.errors.code[0]);
            } else {
                toast.error('An error occurred. Please double-check your code.');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <CustomerLayout title="Recharge / Refill Account">
            <div className="max-w-md mx-auto space-y-6 pt-4">
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-heading font-bold text-slate-800 dark:text-slate-100">Activate Plan with Voucher</h3>
                    <p className="text-slate-500 text-sm font-medium">
                        Enter your 12-character prepaid voucher code to refill your account balance.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 surface-panel p-6 border border-border/50 rounded-[24px] shadow-sm">
                    <div className="space-y-2">
                        <label htmlFor="voucher-code" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
                            Voucher Code
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                                <Key className="h-5 w-5 text-slate-400" />
                            </span>
                            <input
                                id="voucher-code"
                                type="text"
                                placeholder="E.G. A1B2C3D4E5F6"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="input-field text-center font-mono uppercase text-lg tracking-widest placeholder:normal-case placeholder:tracking-normal pl-11"
                                autoComplete="off"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full h-11 mt-2"
                        disabled={processing}
                    >
                        {processing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Activate Voucher'
                        )}
                    </button>
                </form>

                <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div className="space-y-1 font-medium">
                        <h4 className="font-bold">Important Notice:</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Vouchers are single-use only and expire after activation.</li>
                            <li>You can only activate a new voucher if your current package has expired.</li>
                            <li>If you experience any issues, please lodge a support ticket on the portal.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
