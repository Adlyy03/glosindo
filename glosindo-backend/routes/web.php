<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
*/

$router->get('/', function () use ($router) {
    return response()->json([
        'app' => 'GLOSINDO Digital Guestbook API',
        'version' => $router->app->version(),
    ]);
});

// Public routes
$router->group(['prefix' => 'api'], function () use ($router) {
    // Authentication
    $router->post('login', 'AuthController@login');
});

// Protected routes (require JWT token)
$router->group(['prefix' => 'api', 'middleware' => 'jwt.auth'], function () use ($router) {
    // Auth routes
    $router->get('me', 'AuthController@me');
    $router->post('logout', 'AuthController@logout');
    $router->post('refresh', 'AuthController@refresh');

    // Visitors
    $router->get('visitors', 'VisitorController@index');
    $router->post('visitors', 'VisitorController@store');
    $router->get('visitors/{id}', 'VisitorController@show');
    $router->put('visitors/{id}', 'VisitorController@update');
    $router->post('visitors/{id}', 'VisitorController@update');
    $router->delete('visitors/{id}', ['middleware' => 'role:admin', 'uses' => 'VisitorController@destroy']);

    // Face Embeddings
    $router->get('face-embeddings', 'FaceEmbeddingController@index');
    $router->post('face-embeddings/check-duplicate', 'FaceEmbeddingController@checkDuplicate');
    $router->post('visitors/{visitorId}/face-embedding', 'FaceEmbeddingController@store');
    $router->delete('visitors/{visitorId}/face-embedding', 'FaceEmbeddingController@destroy');

    // Visits
    $router->get('visits', 'VisitController@index');
    $router->get('visits/active', 'VisitController@active');
    $router->get('visits/history', 'VisitController@history');
    $router->post('visits', 'VisitController@store');
    $router->get('visits/{id}', 'VisitController@show');
    $router->put('visits/{id}/checkout', 'VisitController@checkout');
    $router->delete('visits/{id}', ['middleware' => 'role:admin', 'uses' => 'VisitController@destroy']);

    // Dashboard
    $router->get('dashboard/stats', 'DashboardController@stats');
    $router->get('dashboard/visit-trends', 'DashboardController@visitTrends');
    $router->get('dashboard/monthly-trends', 'DashboardController@monthlyTrends');
    $router->get('dashboard/top-visitors', 'DashboardController@topVisitors');
});

// Swagger UI route
$router->get('swagger', function () {
    $path = public_path('swagger/index.html');
    
    if (!file_exists($path)) {
        abort(404);
    }
    
    return response(file_get_contents($path), 200)->header('Content-Type', 'text/html');
});

// Serve OpenAPI YAML
$router->get('docs/openapi.yaml', function () {
    $path = base_path('docs/openapi.yaml');
    
    if (!file_exists($path)) {
        abort(404);
    }
    
    return response(file_get_contents($path), 200)
        ->header('Content-Type', 'text/yaml')
        ->header('Access-Control-Allow-Origin', '*');
});

// Serve uploaded files
$router->get('storage/{folder}/{filename}', function ($folder, $filename) {
    $path = storage_path('app/public/' . $folder . '/' . $filename);
    
    if (!file_exists($path)) {
        abort(404);
    }
    
    $file = file_get_contents($path);
    $type = mime_content_type($path);
    
    return response($file, 200)->header('Content-Type', $type);
});
