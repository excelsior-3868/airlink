<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Router;
use App\Services\Provisioning\RouterOSService;

$routers = Router::where('ip_address', '!=', '172.22.22.7')->get();
echo "Found " . count($routers) . " router(s).\n\n";

$routerService = new RouterOSService();

foreach ($routers as $router) {
    $start = microtime(true);
    echo "Connecting to Router: {$router->name} (IP: {$router->ip_address}, Port: {$router->port})...\n";
    try {
        $client = $routerService->connect($router);
        echo "Successfully connected to {$router->name}! Time: " . (microtime(true) - $start) . "s\n";
    } catch (\Throwable $e) {
        echo "FAILED to connect to {$router->name}! Error: " . $e->getMessage() . "\n";
        echo "Time taken: " . (microtime(true) - $start) . "s\n";
    }
    echo "\n";
}
