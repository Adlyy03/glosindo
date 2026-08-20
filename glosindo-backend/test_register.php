<?php
$app = require __DIR__ . '/bootstrap/app.php';
$app->boot();

$code = 'lomba-makan-nzja1';
$controller = new \App\Http\Controllers\EventController();

// Generate dummy 128-d vector
$faceVector = array_fill(0, 128, 0.12345);
$photo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

$request = \Illuminate\Http\Request::create("/api/public/events/{$code}/register", 'POST', [
    'name' => 'Budi Santoso 2',
    'phone' => '081234567891',
    'email' => 'budi2@example.com',
    'company' => 'PT Glosindo',
    'position' => 'Staff',
    'face_vector' => $faceVector,
    'photo' => $photo,
]);

try {
    $resp = $controller->publicRegister($request, $code);
    echo "Status code: " . $resp->getStatusCode() . "\n";
    echo "Body: " . $resp->getContent() . "\n";
} catch (\Throwable $e) {
    echo "EXCEPTION CAUGHT: " . get_class($e) . ": " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
    echo $e->getTraceAsString() . "\n";
}
