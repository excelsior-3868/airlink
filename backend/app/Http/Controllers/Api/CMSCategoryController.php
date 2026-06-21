<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CMSCategoryController extends Controller
{
    /**
     * List all categories with subcategories.
     */
    public function index(): JsonResponse
    {
        $categories = Category::with('subcategories')->get();
        return response()->json($categories);
    }

    /**
     * Store new category.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'categoryName' => 'required|string|unique:category,categoryName',
            'categoryDescription' => 'required|string',
        ]);

        $category = Category::create([
            'categoryName' => $data['categoryName'],
            'categoryDescription' => $data['categoryDescription'],
            'creationDate' => now(),
        ]);

        return response()->json([
            'message' => 'Category created successfully.',
            'category' => $category,
        ], 210);
    }

    /**
     * Update category.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::find($id);
        if (! $category) {
            return response()->json(['message' => 'Category not found.'], 404);
        }

        $data = $request->validate([
            'categoryName' => 'required|string|unique:category,categoryName,' . $id,
            'categoryDescription' => 'required|string',
        ]);

        $category->update([
            'categoryName' => $data['categoryName'],
            'categoryDescription' => $data['categoryDescription'],
            'updationDate' => now(),
        ]);

        return response()->json([
            'message' => 'Category updated successfully.',
            'category' => $category,
        ]);
    }

    /**
     * Delete category and its subcategories.
     */
    public function destroy(int $id): JsonResponse
    {
        $category = Category::find($id);
        if (! $category) {
            return response()->json(['message' => 'Category not found.'], 404);
        }

        // Delete associated subcategories
        Subcategory::where('categoryid', $id)->delete();
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully.']);
    }

    /**
     * Add subcategory.
     */
    public function storeSubcategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'categoryid' => 'required|integer|exists:category,id',
            'subcategory' => 'required|string',
        ]);

        $sub = Subcategory::create([
            'categoryid' => $data['categoryid'],
            'subcategory' => $data['subcategory'],
            'creationDate' => now(),
        ]);

        return response()->json([
            'message' => 'Subcategory created successfully.',
            'subcategory' => $sub,
        ], 210);
    }

    /**
     * Delete subcategory.
     */
    public function destroySubcategory(int $id): JsonResponse
    {
        $sub = Subcategory::find($id);
        if (! $sub) {
            return response()->json(['message' => 'Subcategory not found.'], 404);
        }
        $sub->delete();

        return response()->json(['message' => 'Subcategory deleted successfully.']);
    }
}
