import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '@/Layouts/CustomerLayout';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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
                    <h3 className="text-lg font-bold text-slate-800">Activate Plan with Voucher</h3>
                    <p className="text-slate-500 text-sm">
                        Enter your 12-character prepaid voucher code to refill your account balance.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 border rounded-xl p-6 shadow-sm">
                    <div className="space-y-2">
                        <label htmlFor="voucher-code" className="text-sm font-semibold text-slate-700">
                            Voucher Code
                        </label>
                        <Input
                            id="voucher-code"
                            type="text"
                            placeholder="e.g. A1B2C3D4E5F6"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="text-center font-mono uppercase text-lg tracking-widest placeholder:normal-case placeholder:tracking-normal"
                            autoComplete="off"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 transition" disabled={processing}>
                        {processing ? 'Processing activation...' : 'Activate Voucher'}
                    </Button>
                </form>

                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-4 shadow-sm">
                    <h4 className="font-bold mb-1">Important Notice:</h4>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Vouchers are single-use only and expire after activation.</li>
                        <li>You can only activate a new voucher if your current package has expired.</li>
                        <li>If you experience any issues, please lodge a support ticket on the portal.</li>
                    </ul>
                </div>
            </div>
        </CustomerLayout>
    );
}
