<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$collate = DB::getDriverName() === 'sqlite' ? '' : 'COLLATE utf8mb4_unicode_ci';

echo "Benchmarking Voucher Allocation Summary query variations...\n\n";

// Test Option A: t.code = r.username COLLATE utf8mb4_unicode_ci
$start = microtime(true);
echo "Testing Option A (casting radacct.username to unicode)...\n";
$qA = "
    SELECT 
        t.allocation,
        COUNT(distinct(code)) AS count, MIN(id) AS first_id, MAX(id) AS last_id,
        COUNT(DISTINCT r.username) AS matching_users
    FROM tbl_voucher t 
    LEFT JOIN radacct r ON t.code = r.username COLLATE utf8mb4_unicode_ci
    WHERE allocation <> '0'
    GROUP BY t.allocation 
    ORDER BY matching_users DESC
";
$resA = DB::select($qA);
echo "Option A duration: " . (microtime(true) - $start) . "s. Row count: " . count($resA) . "\n\n";

// Test Option B: t.code COLLATE utf8mb4_general_ci = r.username
$start = microtime(true);
echo "Testing Option B (casting tbl_voucher.code to general_ci)...\n";
$qB = "
    SELECT 
        t.allocation,
        COUNT(distinct(code)) AS count, MIN(id) AS first_id, MAX(id) AS last_id,
        COUNT(DISTINCT r.username) AS matching_users
    FROM tbl_voucher t 
    LEFT JOIN radacct r ON t.code COLLATE utf8mb4_general_ci = r.username
    WHERE allocation <> '0'
    GROUP BY t.allocation 
    ORDER BY matching_users DESC
";
$resB = DB::select($qB);
echo "Option B duration: " . (microtime(true) - $start) . "s. Row count: " . count($resB) . "\n\n";

// Test Option Original: t.code COLLATE utf8mb4_unicode_ci = r.username COLLATE utf8mb4_unicode_ci
$start = microtime(true);
echo "Testing Original Option (casting both sides)...\n";
$qOrig = "
    SELECT 
        t.allocation,
        COUNT(distinct(code)) AS count, MIN(id) AS first_id, MAX(id) AS last_id,
        COUNT(DISTINCT r.username) AS matching_users
    FROM tbl_voucher t 
    LEFT JOIN radacct r ON t.code COLLATE utf8mb4_unicode_ci = r.username COLLATE utf8mb4_unicode_ci
    WHERE allocation <> '0'
    GROUP BY t.allocation 
    ORDER BY matching_users DESC
";
$resOrig = DB::select($qOrig);
echo "Original Option duration: " . (microtime(true) - $start) . "s. Row count: " . count($resOrig) . "\n\n";
