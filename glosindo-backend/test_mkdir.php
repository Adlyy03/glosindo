<?php
$app = require __DIR__ . '/bootstrap/app.php';
$app->boot();

$storageDir = storage_path('app/public/visitors');
if (!is_dir($storageDir)) {
    mkdir($storageDir, 0755, true);
}
echo "storageDir: {$storageDir} exists: " . (is_dir($storageDir) ? 'YES' : 'NO') . "\n";
