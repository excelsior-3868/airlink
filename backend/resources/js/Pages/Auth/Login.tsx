import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Username */}
                <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                        Username
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            placeholder="Enter your username"
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('username', e.target.value)}
                            className="pl-9 bg-white border-slate-200 focus-visible:ring-[hsl(209,100%,32%)] focus-visible:border-[hsl(209,100%,32%)]"
                        />
                    </div>
                    {errors.username && (
                        <p className="text-xs text-red-600">{errors.username}</p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                            Password
                        </Label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-medium text-[hsl(209,100%,32%)] hover:text-[hsl(209,100%,24%)] transition-colors"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            className="pl-9 pr-10 bg-white border-slate-200 focus-visible:ring-[hsl(209,100%,32%)] focus-visible:border-[hsl(209,100%,32%)]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword
                                ? <EyeOff className="size-4" />
                                : <Eye className="size-4" />
                            }
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-600">{errors.password}</p>
                    )}
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2">
                    <input
                        id="remember"
                        type="checkbox"
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked as false)}
                        className="size-4 rounded border-slate-300 text-[hsl(209,100%,32%)] focus:ring-[hsl(209,100%,32%)] cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">
                        Keep me signed in
                    </label>
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={processing}
                    className="btn-nt-primary w-full h-10 text-sm font-semibold tracking-wide shadow-md"
                >
                    {processing ? 'Signing in…' : 'Sign In'}
                </Button>
            </form>
        </GuestLayout>
    );
}
