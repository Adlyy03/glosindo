<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->boot();
$request = new Illuminate\Http\Request();
$request->setMethod('POST');
$request->request->add(['email' => 'admin@glosindo.com', 'password' => 'Admin123!']);
$response = (new App\Http\Controllers\AuthController())->login($request);
echo $response->getContent();
