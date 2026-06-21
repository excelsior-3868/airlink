import { AppSidebar } from '@/components/AppSidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { PropsWithChildren, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

interface SharedProps {
    auth: { user: { name: string; username: string; role: string } };
    flash: { success?: string; error?: string };
}

const ROLE_COLORS: Record<string, string> = {
    admin:    'bg-violet-100 text-violet-700',
    manager:  'bg-blue-100 text-blue-700',
    agent:    'bg-emerald-100 text-emerald-700',
};

export default function AppLayout({
    title,
    children,
}: PropsWithChildren<{ title?: ReactNode }>) {
    const { auth, flash } = usePage().props as unknown as SharedProps;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const roleClass = ROLE_COLORS[auth.user.role?.toLowerCase()] ?? 'bg-slate-100 text-slate-700';
    const initials = auth.user.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {/* ── Brand header bar ──────────────────────────── */}
                <header className="brand-header sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 px-4 shadow-sm">
                    <SidebarTrigger className="-ml-1 text-white/80 hover:text-white hover:bg-white/10 transition-colors" />
                    <Separator orientation="vertical" className="mr-1 h-4 bg-white/20" />

                    {/* Page title */}
                    <h1 className="text-sm font-semibold text-white/90 tracking-wide">
                        {title}
                    </h1>

                    {/* Right — user menu */}
                    <div className="ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-white/10 transition-colors cursor-pointer outline-none">
                                {/* Avatar */}
                                <div className="flex size-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white ring-2 ring-white/30">
                                    {initials}
                                </div>
                                <div className="hidden flex-col text-left sm:flex">
                                    <span className="text-xs font-semibold text-white leading-tight">
                                        {auth.user.name}
                                    </span>
                                    <span className="text-[10px] text-white/60 leading-tight capitalize">
                                        {auth.user.role}
                                    </span>
                                </div>
                                <ChevronDown className="size-3.5 text-white/60" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-52 shadow-lg">
                                <DropdownMenuLabel className="font-normal pb-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-sm">{auth.user.name}</span>
                                        <span className="text-xs text-muted-foreground">@{auth.user.username}</span>
                                        <span className={`mt-0.5 w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleClass}`}>
                                            {auth.user.role}
                                        </span>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('profile.edit')} className="cursor-pointer">
                                        <UserIcon className="mr-2 size-4" />
                                        My Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="w-full cursor-pointer text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Sign Out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </SidebarInset>
            <Toaster richColors position="top-right" />
        </SidebarProvider>
    );
}
