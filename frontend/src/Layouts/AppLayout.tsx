import { CollapsibleAppSidebar } from '@/components/AppSidebar';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import React, { type PropsWithChildren, type ReactNode, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { NAV, getColorClasses } from '@/components/AppSidebar';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                "relative size-9 rounded-md text-foreground hover:bg-accent active:scale-95 transition-all overflow-hidden cursor-pointer",
                className
            )}
            title="Toggle theme"
        >
            <span className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-300",
                isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
            )}>
                <Sun className="h-5 w-5 text-[#E6B646]" />
            </span>
            <span className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-300",
                isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
            )}>
                <Moon className="h-5 w-5 text-indigo-500" />
            </span>
        </button>
    );
}

function AppLayoutContent({
    title,
    children,
}: PropsWithChildren<{ title?: ReactNode }>) {
    const { user } = useAuth();
    const location = useLocation();

    // Find active navigation item to extract label and icon
    let activeIcon: React.ElementType | null = null;
    let activeColor = 'slate';
    let activeLabel = typeof title === 'string' ? title : '';

    for (const group of NAV) {
        if (group.path && (location.pathname === group.path || location.pathname.startsWith(group.path + '/'))) {
            activeIcon = group.icon;
            activeColor = group.color;
            if (!activeLabel) activeLabel = group.label;
        }
        if (group.items) {
            const subMatch = group.items.find(item => item.path && (location.pathname === item.path || location.pathname.startsWith(item.path + '/')));
            if (subMatch) {
                activeIcon = subMatch.icon || group.icon;
                activeColor = group.color;
                if (!activeLabel) activeLabel = subMatch.label;
            }
        }
    }

    if (!activeLabel && typeof title === 'string') {
        activeLabel = title;
    }

    useEffect(() => {
        if (activeLabel) {
            document.title = `${activeLabel} | Nepal Airlink`;
        } else {
            document.title = 'Nepal Airlink';
        }
    }, [activeLabel]);

    if (!user) return null;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-foreground">
            <CollapsibleAppSidebar />
            <SidebarInset className="flex flex-col h-full overflow-hidden !bg-slate-50 dark:!bg-slate-950 text-foreground">
                <main className="flex-1 p-4 sm:p-6 md:py-6 md:pr-6 md:pl-4 flex flex-col gap-6 overflow-y-auto no-scrollbar w-full">
                    {(activeLabel || title) && (
                        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <SidebarTrigger className="-ml-1 md:hidden text-primary" />
                                {activeIcon && (
                                    <div className="flex size-6 items-center justify-center shrink-0">
                                        {React.createElement(activeIcon, {
                                            className: cn("size-6", getColorClasses(activeColor).icon)
                                        })}
                                    </div>
                                )}
                                <h1 className="text-2xl font-bold text-primary">
                                    {activeLabel || title}
                                </h1>
                            </div>
                        </div>
                    )}
                    <div className="flex-1 w-full">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </div>
    );
}

export default function AppLayout({
    title,
    children,
}: PropsWithChildren<{ title?: ReactNode }>) {
    return (
        <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
            <AppLayoutContent title={title}>
                {children}
            </AppLayoutContent>
            <Toaster richColors position="top-right" />
        </SidebarProvider>
    );
}
