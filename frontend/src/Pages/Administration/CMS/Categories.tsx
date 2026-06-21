import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Folder, FolderOpen, List } from 'lucide-react';
import { toast } from 'sonner';

interface Subcategory {
    id: number;
    categoryid: number;
    subcategory: string;
}

interface Category {
    id: number;
    categoryName: string;
    categoryDescription: string;
    subcategories: Subcategory[];
}

export default function CMSCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Forms
    const [catName, setCatName] = useState('');
    const [catDesc, setCatDesc] = useState('');
    const [subName, setSubName] = useState('');

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const loadCategories = async () => {
        try {
            const res = await api.get('/cms/categories');
            setCategories(res.data);
            if (selectedCategory) {
                const refreshed = res.data.find((c: Category) => c.id === selectedCategory.id);
                setSelectedCategory(refreshed || null);
            }
        } catch (e) {
            toast.error('Failed to load categories list.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreateCategory = async (e: FormEvent) => {
        e.preventDefault();
        if (!catName.trim() || !catDesc.trim()) return;

        setProcessing(true);
        try {
            await api.post('/cms/categories', {
                categoryName: catName.trim(),
                categoryDescription: catDesc.trim(),
            });
            toast.success('Category created successfully!');
            setCatName('');
            setCatDesc('');
            loadCategories();
        } catch (err) {
            toast.error('Failed to create category.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Are you sure? This will delete all subcategories under this category.')) return;

        try {
            await api.delete(`/cms/categories/${id}`);
            toast.success('Category deleted successfully.');
            if (selectedCategory?.id === id) {
                setSelectedCategory(null);
            }
            loadCategories();
        } catch (e) {
            toast.error('Failed to delete category.');
        }
    };

    const handleCreateSubcategory = async (e: FormEvent) => {
        e.preventDefault();
        if (!subName.trim() || !selectedCategory) return;

        setProcessing(true);
        try {
            await api.post('/cms/subcategories', {
                categoryid: selectedCategory.id,
                subcategory: subName.trim(),
            });
            toast.success('Subcategory created successfully!');
            setSubName('');
            loadCategories();
        } catch (err) {
            toast.error('Failed to create subcategory.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteSubcategory = async (id: number) => {
        if (!confirm('Are you sure you want to delete this subcategory?')) return;

        try {
            await api.delete(`/cms/subcategories/${id}`);
            toast.success('Subcategory deleted successfully.');
            loadCategories();
        } catch (e) {
            toast.error('Failed to delete subcategory.');
        }
    };

    if (loading && categories.length === 0) {
        return (
            <AppLayout title="CMS Categories">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="CMS Category Management">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {/* Left Panel: Category Setup Forms */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Add Category Form */}
                    <form onSubmit={handleCreateCategory} className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-1.5">
                            <Plus className="size-4 text-indigo-600" /> Create Category
                        </h3>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Category Name *</label>
                            <Input
                                placeholder="e.g. Internet Connectivity"
                                value={catName}
                                onChange={(e) => setCatName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Category Description *</label>
                            <Textarea
                                placeholder="Describe this ticket class..."
                                value={catDesc}
                                onChange={(e) => setCatDesc(e.target.value)}
                                rows={3}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Category'}
                        </Button>
                    </form>

                    {/* Add Subcategory Form */}
                    {selectedCategory && (
                        <form onSubmit={handleCreateSubcategory} className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                            <h3 className="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-1.5">
                                <Plus className="size-4 text-indigo-600" /> Add Sub-category
                            </h3>
                            <div className="space-y-2">
                                <span className="text-xs text-slate-500 block">
                                    Parent Category: <strong className="font-semibold text-slate-800">{selectedCategory.categoryName}</strong>
                                </span>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">Sub-category Name *</label>
                                    <Input
                                        placeholder="e.g. PPPoE Red Light blinking"
                                        value={subName}
                                        onChange={(e) => setSubName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold" disabled={processing}>
                                {processing ? 'Adding...' : 'Add Sub-category'}
                            </Button>
                        </form>
                    )}
                </div>

                {/* Right Panel: Categories Lists */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Categories Table */}
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-slate-50 border-b px-4 py-3">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                <Folder className="size-4 text-indigo-600" /> Ticket Categories
                            </h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-6 text-slate-500">
                                            No ticket categories configured.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((c) => (
                                        <TableRow 
                                            key={c.id}
                                            className={`cursor-pointer ${selectedCategory?.id === c.id ? 'bg-indigo-50/50' : ''}`}
                                            onClick={() => setSelectedCategory(c)}
                                        >
                                            <TableCell className="font-semibold">{c.categoryName}</TableCell>
                                            <TableCell className="max-w-xs truncate">{c.categoryDescription}</TableCell>
                                            <TableCell className="text-right flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setSelectedCategory(c)}
                                                    className="text-indigo-600"
                                                >
                                                    <List className="size-4 mr-1" /> Sub-items
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteCategory(c.id)}
                                                    className="text-rose-600 hover:text-rose-700"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Subcategories Table (Depends on Selection) */}
                    {selectedCategory && (
                        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-slate-50 border-b px-4 py-3 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                    <FolderOpen className="size-4 text-indigo-600" /> Sub-categories under "{selectedCategory.categoryName}"
                                </h3>
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                    {selectedCategory.subcategories?.length || 0} sub-items
                                </Badge>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sub-category Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!selectedCategory.subcategories || selectedCategory.subcategories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center py-6 text-slate-500">
                                                No sub-categories configured for this group.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        selectedCategory.subcategories.map((s) => (
                                            <TableRow key={s.id}>
                                                <TableCell>{s.subcategory}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteSubcategory(s.id)}
                                                        className="text-rose-600 hover:text-rose-700"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
