import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function BackupRestore() {
    const [file, setFile] = useState<File | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    const handleDownload = async () => {
        try {
            const res = await api.get('/backup/export', { responseType: 'blob' });
            
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Generate filename based on date
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `airlink_backup_${date}.sql`);
            
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            
            toast.success('Backup downloaded successfully.');
        } catch (error) {
            toast.error('Failed to generate backup.');
            console.error(error);
        }
    };

    const handleRestore = async () => {
        if (!file) {
            toast.error('Please select a .sql backup file first.');
            return;
        }

        setIsRestoring(true);
        const formData = new FormData();
        formData.append('backup_file', file);

        try {
            const res = await api.post('/backup/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success(res.data.message || 'Database restored successfully.');
            setFile(null);
            
            // Reload the page to ensure the UI gets the latest data state
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to restore database.');
            console.error(error);
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <AppLayout title="Backup & Restore">
            <div className="mx-auto max-w-4xl space-y-6">
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Download className="size-5" />
                            Export Database
                        </CardTitle>
                        <CardDescription>
                            Download a full copy of your database including all customers, plans, and configuration. Keep this file safe.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleDownload} className="bg-[#13366e] hover:bg-[#0f2a57]">
                            <Download className="mr-2 size-4" />
                            Download Full Backup (.sql)
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-destructive">
                            <UploadCloud className="size-5" />
                            Restore Database
                        </CardTitle>
                        <CardDescription className="text-destructive/80">
                            Warning: Restoring a database will overwrite all current data. Make sure you know what you are doing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept=".sql"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-slate-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-primary/10 file:text-primary
                                  hover:file:bg-primary/20
                                "
                            />
                        </div>
                        <Button 
                            variant="destructive" 
                            onClick={handleRestore}
                            disabled={!file || isRestoring}
                        >
                            {isRestoring ? 'Restoring...' : 'Restore from Backup'}
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
