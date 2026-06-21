import { Link } from '@inertiajs/react';
import { Wifi } from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="gradient-background forced-light flex min-h-screen items-center justify-center p-4">
            <div className="glass-card w-full max-w-md rounded-2xl shadow-2xl">
                {/* Card header */}
                <div className="flex flex-col items-center gap-3 border-b border-white/30 px-8 py-7">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-[hsl(209,100%,32%)] shadow-lg transition-transform duration-200 group-hover:scale-105">
                            <Wifi className="size-6 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-xl font-bold text-slate-900 leading-tight">Airlink</p>
                            <p className="text-xs text-slate-500 leading-tight">ISP Billing System</p>
                        </div>
                    </Link>
                </div>

                {/* Form area */}
                <div className="px-8 py-7">
                    {children}
                </div>

                {/* Footer */}
                <div className="border-t border-white/30 px-8 py-4 text-center">
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} Airlink &mdash; ISP Billing & Management
                    </p>
                </div>
            </div>
        </div>
    );
}
