<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->boot();
echo App\Models\FaceEmbedding::count();
