import { useState } from 'react';
import type { FormEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import InputError from '@/components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/components/ApplicationLogo';
import Footer from '@/components/Footer';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        login(username, password)
            .then(() => {
                setProcessing(false);
                navigate('/dashboard');
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full glass-card p-6 sm:p-8 lg:p-10 border border-white/70 shadow-2xl"
            >
                <div className="flex flex-col items-center gap-1 mb-6 sm:mb-8 text-center">
                    <ApplicationLogo className="w-24 h-24 object-contain mb-1" />
                    <div>
                        <h1 className="text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-[#002152] via-[#ef627d] to-[#002152] bg-clip-text text-transparent">
                            Airlink
                        </h1>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 font-medium">
                            Please enter your credentials to access Airlink OS.
                        </p>
                    </div>
                </div>

                {errors.username && !errors.username[0].includes('required') && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-4 sm:mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive text-xs sm:text-sm font-medium"
                    >
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{errors.username[0]}</span>
                    </motion.div>
                )}

                <form onSubmit={submit} className="flex flex-col gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                        <div className="relative">
                            <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground sm:w-[18px] sm:h-[18px]" size={16} />
                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={username}
                                placeholder="Username or Email Address"
                                className={`input-field !pl-10 !sm:pl-12 h-11 sm:h-12 text-xs sm:text-sm ${errors.username ? 'border-destructive' : ''}`}
                                autoComplete="username"
                                required
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <InputError message={errors.username?.[0]} className="mt-1" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="relative">
                            <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground sm:w-[18px] sm:h-[18px]" size={16} />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={password}
                                placeholder="Password"
                                className={`input-field !pl-10 !sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-12 text-xs sm:text-sm ${errors.password ? 'border-destructive' : ''}`}
                                autoComplete="current-password"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none bg-transparent border-none"
                            >
                                {showPassword ? (
                                    <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" />
                                ) : (
                                    <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password?.[0]} className="mt-1" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs mt-1">
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-muted-foreground group whitespace-nowrap">
                            <input type="checkbox" className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                            <span className="group-hover:text-primary transition-colors font-bold">Keep signed in</span>
                        </label>
                        <a href="#" className="font-bold text-primary hover:underline">Forgot password?</a>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary relative isolate overflow-hidden w-full h-11 sm:h-12 flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-primary/20 text-xs sm:text-sm font-semibold border-none"
                        >
                            <span className="pointer-events-none absolute inset-y-0 right-0 w-28 rounded-r-2xl bg-gradient-to-r from-rose-200/0 via-rose-200/22 to-rose-300/42" />
                            {processing ? (
                                <div className="relative z-10 w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                                    <LogIn size={18} className="sm:w-5 sm:h-5" />
                                    <span>Sign In to Portal</span>
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>

            <Footer />
        </GuestLayout>
    );
}
