<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class SetupController extends Controller
{
    /**
     * Check if installation is already completed.
     */
    private function isInstalled(): bool
    {
        // If tbl_users has any user, we consider the app installed to avoid re-runs
        try {
            return DB::connection()->getSchemaBuilder()->hasTable('tbl_users') 
                && User::where('user_type', 'Admin')->exists();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Check requirements.
     */
    public function precheck(): JsonResponse
    {
        if ($this->isInstalled()) {
            return response()->json(['installed' => true, 'message' => 'Application is already configured.'], 400);
        }

        $phpVersion = phpversion();
        $pdo = extension_loaded('pdo_mysql');
        $storageWritable = is_writable(storage_path());
        $cacheWritable = is_writable(bootstrap_path('cache'));

        $requirements = [
            'php_version' => [
                'checked' => version_compare($phpVersion, '8.2.0', '>='),
                'value' => $phpVersion,
                'required' => '>= 8.2.0'
            ],
            'pdo_mysql' => [
                'checked' => $pdo,
                'value' => $pdo ? 'Enabled' : 'Disabled',
                'required' => 'Enabled'
            ],
            'storage_writable' => [
                'checked' => $storageWritable,
                'value' => $storageWritable ? 'Writable' : 'Not Writable',
                'required' => 'Writable'
            ],
            'cache_writable' => [
                'checked' => $cacheWritable,
                'value' => $cacheWritable ? 'Writable' : 'Not Writable',
                'required' => 'Writable'
            ]
        ];

        $passed = collect($requirements)->every(fn($req) => $req['checked'] === true);

        return response()->json([
            'passed' => $passed,
            'requirements' => $requirements
        ]);
    }

    /**
     * Configure database details.
     */
    public function database(Request $request): JsonResponse
    {
        if ($this->isInstalled()) {
            return response()->json(['message' => 'Application is already configured.'], 400);
        }

        $data = $request->validate([
            'db_host' => 'required|string',
            'db_port' => 'required|string',
            'db_database' => 'required|string',
            'db_username' => 'required|string',
            'db_password' => 'nullable|string',
        ]);

        // Test DB connection
        try {
            $config = config('database.connections.mysql');
            $config['host'] = $data['db_host'];
            $config['port'] = $data['db_port'];
            $config['database'] = $data['db_database'];
            $config['username'] = $data['db_username'];
            $config['password'] = $data['db_password'] ?? '';

            config(['database.connections.setup_test' => $config]);
            DB::connection('setup_test')->getPdo();
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to connect to database: ' . $e->getMessage()
            ], 422);
        }

        // Write to .env
        $this->updateEnv([
            'DB_HOST' => $data['db_host'],
            'DB_PORT' => $data['db_port'],
            'DB_DATABASE' => $data['db_database'],
            'DB_USERNAME' => $data['db_username'],
            'DB_PASSWORD' => $data['db_password'] ?? '',
        ]);

        return response()->json(['message' => 'Database connection successful and config saved.']);
    }

    /**
     * Run migrations.
     */
    public function migrate(): JsonResponse
    {
        if ($this->isInstalled()) {
            return response()->json(['message' => 'Application is already configured.'], 400);
        }

        try {
            Artisan::call('migrate', ['--force' => true]);
            $migrateOutput = Artisan::output();
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Migration failed: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => 'Database migrations completed successfully.',
            'output' => $migrateOutput
        ]);
    }

    /**
     * Set up the initial administrator.
     */
    public function admin(Request $request): JsonResponse
    {
        if ($this->isInstalled()) {
            return response()->json(['message' => 'Application is already configured.'], 400);
        }

        $data = $request->validate([
            'username' => 'required|string|min:4',
            'fullname' => 'required|string|min:4',
            'password' => 'required|string|min:6',
        ]);

        // Register default admin
        $admin = User::create([
            'username' => $data['username'],
            'fullname' => $data['fullname'],
            'password' => Hash::make($data['password']),
            'user_type' => UserRole::Admin,
            'role' => UserRole::Admin,
            'status' => 'Active',
            'creationdate' => now(),
        ]);

        return response()->json([
            'message' => 'Administrator account created successfully. Installation complete!',
            'admin' => [
                'username' => $admin->username,
                'fullname' => $admin->fullname,
            ]
        ]);
    }

    /**
     * Helper to write DB keys into the .env file.
     */
    private function updateEnv(array $data): void
    {
        $envPath = base_path('.env');
        if (! File::exists($envPath)) {
            // Copy example if it doesn't exist
            if (File::exists(base_path('.env.example'))) {
                File::copy(base_path('.env.example'), $envPath);
            } else {
                File::put($envPath, '');
            }
        }

        $content = File::get($envPath);

        foreach ($data as $key => $value) {
            $escaped = preg_quote($key, '/');
            // If key exists, replace it
            if (preg_match("/^{$escaped}=/m", $content)) {
                $content = preg_replace("/^{$escaped}=.*/m", "{$key}=\"{$value}\"", $content);
            } else {
                // Otherwise append
                $content .= "\n{$key}=\"{$value}\"";
            }
        }

        File::put($envPath, trim($content) . "\n");
    }
}
