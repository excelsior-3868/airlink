import type { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {/* Background decorative elements are handled globally via body in index.css */}
            <div className="relative z-10 flex w-full max-w-md flex-col items-center">
                {children}
            </div>
        </div>
    );
}
