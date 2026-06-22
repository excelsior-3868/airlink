import ApplicationLogo from '@/components/ApplicationLogo';
import type { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="forced-light gradient-background flex min-h-screen flex-col items-center justify-center p-4 transition-all duration-300">
            <div className="w-full max-w-[420px] bg-white/75 dark:bg-slate-900/70 backdrop-blur-xl -webkit-backdrop-blur-xl px-8 py-10 rounded-[32px] border border-white/40 dark:border-slate-800/30 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.18),0_18px_36px_-18px_rgba(0,0,0,0.15)] transition-all">
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="size-16 flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[20px] mb-3.5 shadow-sm">
                        <ApplicationLogo className="size-full object-contain dark:invert" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        <span className="bg-gradient-to-r from-primary to-blue-600 dark:to-indigo-400 bg-clip-text text-transparent">Nepal Airlink</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1.5 text-center">
                        Please enter your credentials to access Airlink OS.
                    </p>
                </div>

                {children}
            </div>

            <div className="mt-8 text-center text-[10px] text-muted-foreground font-semibold space-y-1">
                <p>&copy; {new Date().getFullYear()} Nepal Airlink. All rights reserved.</p>
                <p>Developed By: <span className="text-primary font-bold">Netcare Nepal Pvt Ltd</span></p>
            </div>
        </div>
    );
}
