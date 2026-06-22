import { useState, useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import InputError from '@/components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    useEffect(() => {
        document.title = 'Login | Nepal Airlink';
    }, []);

    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [portal, setPortal] = useState<'staff' | 'customer'>('staff');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        login(username, password, portal)
            .then(() => {
                setProcessing(false);
                if (portal === 'customer') {
                    navigate('/customer/dashboard');
                } else {
                    navigate('/dashboard');
                }
            })
            .catch((err) => {
                setProcessing(false);
                if (err.response && err.response.status === 422) {
                    setErrors(err.response.data.errors || {});
                } else if (err.response && err.response.data && err.response.data.message) {
                    setErrors({ username: [err.response.data.message] });
                } else {
                    setErrors({ username: ['An error occurred. Please try again.'] });
                }
            });
    };

    return (
        <GuestLayout>
            <div className="mb-5 flex rounded-xl bg-slate-50 dark:bg-slate-900/60 p-1 border border-slate-100 dark:border-slate-800/40">
                <button
                    type="button"
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                        portal === 'staff'
                            ? 'bg-white dark:bg-card text-primary shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    onClick={() => {
                        setPortal('staff');
                        setErrors({});
                    }}
                >
                    Staff Login
                </button>
                <button
                    type="button"
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                        portal === 'customer'
                            ? 'bg-white dark:bg-card text-primary shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    onClick={() => {
                        setPortal('customer');
                        setErrors({});
                    }}
                >
                    Customer Login
                </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 size-4 text-slate-400" />
                        <input
                            id="username"
                            type="text"
                            name="username"
                            placeholder="username or email"
                            value={username}
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-blue-50/40 dark:bg-slate-900/40 border border-blue-100/50 focus:border-primary focus:bg-white dark:border-slate-800 dark:focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                            autoComplete="username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <InputError message={errors.username?.[0]} className="mt-1.5 text-xs text-red-500" />
                </div>

                <div>
                    <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 size-4 text-slate-400" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="password"
                            value={password}
                            required
                            className="w-full pl-10 pr-10 py-2.5 bg-blue-50/40 dark:bg-slate-900/40 border border-blue-100/50 focus:border-primary focus:bg-white dark:border-slate-800 dark:focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                            autoComplete="current-password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password?.[0]} className="mt-1.5 text-xs text-red-500" />
                </div>

                <div className="flex items-center justify-between text-xs font-semibold pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 select-none">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 dark:border-slate-800 text-primary focus:ring-primary size-4 cursor-pointer"
                        />
                        <span>Keep signed in</span>
                    </label>
                    <a href="#" className="text-primary hover:opacity-80 transition-all">Forgot password?</a>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary to-indigo-800 hover:opacity-95 text-white font-bold text-sm shadow-[0_8px_20px_-6px_rgba(0,90,204,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(0,90,204,0.5)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                        disabled={processing}
                    >
                        {processing ? (
                            <span>Logging in...</span>
                        ) : (
                            <>
                                <LogIn className="size-4" />
                                <span>Sign In to Portal</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
