<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;

class CustomPagesController extends Controller
{
    /**
     * List all available custom pages.
     */
    public function index(): JsonResponse
    {
        $dir = resource_path('pages');
        if (! File::exists($dir)) {
            return response()->json([]);
        }

        $files = File::files($dir);
        $pages = [];

        foreach ($files as $file) {
            if ($file->getExtension() === 'html') {
                $slug = $file->getFilenameWithoutExtension();
                // Beautify label (e.g. Order_Voucher -> Order Voucher)
                $label = str_replace('_', ' ', $slug);
                $pages[] = [
                    'slug' => $slug,
                    'title' => ucwords($label),
                ];
            }
        }

        return response()->json($pages);
    }

    /**
     * Show a custom page's HTML content.
     */
    public function show(string $slug): JsonResponse
    {
        // Safe check to avoid directory traversal
        $slug = basename($slug);
        $path = resource_path("pages/{$slug}.html");

        if (! File::exists($path)) {
            return response()->json(['message' => 'Page not found.'], 404);
        }

        $content = File::get($path);

        return response()->json([
            'slug' => $slug,
            'title' => ucwords(str_replace('_', ' ', $slug)),
            'content' => $content,
        ]);
    }
}
