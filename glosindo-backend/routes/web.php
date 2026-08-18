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
    
    // Public registration
    $router->get('public-registration/status', 'PublicRegistrationController@checkStatus');
    $router->post('public-registration/register', 'PublicRegistrationController@register');
});

// Protected routes (require JWT token)
$router->group(['prefix' => 'api', 'middleware' => 'jwt.auth'], function () use ($router) {
    // Auth routes
    $router->get('me', 'AuthController@me');
    $router->post('logout', 'AuthController@logout');
    $router->post('refresh', 'AuthController@refresh');

    // User Management (Admin only)
    $router->group(['middleware' => 'role:admin'], function () use ($router) {
        $router->get('users', 'UserController@index');
        $router->post('users', 'UserController@store');
        $router->get('users/{id}', 'UserController@show');
        $router->put('users/{id}', 'UserController@update');
        $router->delete('users/{id}', 'UserController@destroy');
    });

    // Visitors - Supervisor get read-only access
    $router->get('visitors', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitorController@index']);
    $router->post('visitors', ['middleware' => 'role:admin,receptionist', 'uses' => 'VisitorController@store']);
    $router->get('visitors/{id}', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitorController@show']);
    $router->put('visitors/{id}', ['middleware' => 'role:admin,receptionist', 'uses' => 'VisitorController@update']);
    $router->post('visitors/{id}', ['middleware' => 'role:admin,receptionist', 'uses' => 'VisitorController@update']);
    $router->delete('visitors/{id}', ['middleware' => 'role:admin', 'uses' => 'VisitorController@destroy']);

    // Face Embeddings
    $router->get('face-embeddings', ['middleware' => 'role:admin', 'uses' => 'FaceEmbeddingController@index']);
    $router->post('face-embeddings/check-duplicate', 'FaceEmbeddingController@checkDuplicate');
    $router->post('visitors/{visitorId}/face-embedding', 'FaceEmbeddingController@store');
    $router->delete('visitors/{visitorId}/face-embedding', ['middleware' => 'role:admin', 'uses' => 'FaceEmbeddingController@destroy']);

    // Visits (ownership handled in controller) - Supervisor get read-only access
    $router->get('visits', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitController@index']);
    $router->get('visits/active', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitController@active']);
    $router->get('visits/history', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitController@history']);
    $router->post('visits', ['middleware' => 'role:admin,receptionist', 'uses' => 'VisitController@store']);
    $router->get('visits/{id}', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitController@show']);
    $router->put('visits/{id}/checkout', ['middleware' => 'role:admin,receptionist', 'uses' => 'VisitController@checkout']);
    $router->delete('visits/{id}', ['middleware' => 'role:admin,receptionist', 'uses' => 'VisitController@destroy']);

    // Dashboard - Admin & Supervisor
    $router->group(['middleware' => 'role:admin,supervisor'], function () use ($router) {
        $router->get('dashboard/stats', 'DashboardController@stats');
        $router->get('dashboard/visit-trends', 'DashboardController@visitTrends');
        $router->get('dashboard/monthly-trends', 'DashboardController@monthlyTrends');
        $router->get('dashboard/top-visitors', 'DashboardController@topVisitors');
    });

    // Dashboard - Receptionist
    $router->get('dashboard/receptionist-stats', ['middleware' => 'role:receptionist', 'uses' => 'DashboardController@receptionistStats']);

    // Public Registration Settings (Admin & Receptionist only)
    $router->post('public-registration/toggle', ['middleware' => 'role:admin,receptionist', 'uses' => 'PublicRegistrationController@toggleStatus']);
    $router->get('public-registration/status', 'PublicRegistrationController@checkStatus');

    // Reports - Admin, Receptionist, Supervisor
    $router->get('reports/statistics', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'ReportController@statistics']);
    $router->get('reports/export-excel', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'ReportController@exportExcel']);
    $router->get('reports/export-pdf', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'ReportController@exportPdf']);
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
