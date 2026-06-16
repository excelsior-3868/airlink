<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupApiController extends Controller
{
    public function export(): StreamedResponse|JsonResponse
    {
        $dbHost = config('database.connections.mysql.host');
        $dbPort = config('database.connections.mysql.port');
        $dbUser = config('database.connections.mysql.username');
        $dbPass = config('database.connections.mysql.password');
        $dbName = config('database.connections.mysql.database');

        $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
        $filepath = storage_path('app/private/' . $filename);

        $command = sprintf(
            'mysqldump --host="%s" --port="%s" --user="%s" --password="%s" "%s" > "%s"',
            addslashes($dbHost),
            addslashes($dbPort),
            addslashes($dbUser),
            addslashes($dbPass),
            addslashes($dbName),
            $filepath
        );

        $result = Process::run($command);

        if (!$result->successful()) {
            return response()->json([
                'message' => 'Failed to generate backup.',
                'error' => $result->errorOutput()
            ], 500);
        }

        return response()->streamDownload(function () use ($filepath) {
            $stream = fopen($filepath, 'rb');
            fpassthru($stream);
            fclose($stream);
            // Cleanup after download
            File::delete($filepath);
        }, $filename, [
            'Content-Type' => 'application/sql',
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'backup_file' => 'required|file|mimetypes:text/plain,application/sql,application/octet-stream|max:500000',
        ]);

        $file = $request->file('backup_file');
        $filepath = $file->getRealPath();

        $dbHost = config('database.connections.mysql.host');
        $dbPort = config('database.connections.mysql.port');
        $dbUser = config('database.connections.mysql.username');
        $dbPass = config('database.connections.mysql.password');
        $dbName = config('database.connections.mysql.database');

        $command = sprintf(
            'mysql --host="%s" --port="%s" --user="%s" --password="%s" "%s" < "%s"',
            addslashes($dbHost),
            addslashes($dbPort),
            addslashes($dbUser),
            addslashes($dbPass),
            addslashes($dbName),
            $filepath
        );

        $result = Process::run($command);

        if (!$result->successful()) {
            return response()->json([
                'message' => 'Failed to restore backup.',
                'error' => $result->errorOutput()
            ], 500);
        }

        return response()->json([
            'message' => 'Database successfully restored.'
        ]);
    }
}
