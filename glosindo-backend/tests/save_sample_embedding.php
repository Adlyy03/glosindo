<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->boot();

$visitor = App\Models\Visitor::first();
$vector = array_fill(0, 128, 0.01);
$visitor->faceEmbedding()->updateOrCreate(
    ['visitor_id' => $visitor->id],
    ['face_vector' => $vector]
);

echo 'saved:' . App\Models\FaceEmbedding::count();
