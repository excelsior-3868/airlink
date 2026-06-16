import AppLayout from '@/Layouts/AppLayout';

export default function Placeholder({ title }: { title: string }) {
    return (
        <AppLayout title={title}>
            <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-muted rounded-lg p-8 bg-card text-card-foreground">
                <h2 className="text-xl font-semibold mb-2">{title} Page</h2>
                <p className="text-muted-foreground text-sm text-center max-w-sm">
                    This section of the standalone React SPA is currently under construction during migration from the monolith.
                </p>
            </div>
        </AppLayout>
    );
}
