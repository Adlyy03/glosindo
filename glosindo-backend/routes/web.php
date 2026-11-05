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

// Handle CORS preflight OPTIONS requests
$router->options('{any:.*}', function () {
    return response('', 200);
});

// Public routes
$router->group(['prefix' => 'api'], function () use ($router) {
    // Authentication (rate limited: 10 attempts per minute to prevent brute force)
    $router->post('login', ['middleware' => 'throttle:10,1', 'uses' => 'AuthController@login']);
    
        // Public guest registration (rate limited: 60 requests per minute)
    $router->get('public-registration/status', 'PublicRegistrationController@checkStatus');
        $router->post('public-registration/register', ['middleware' => 'throttle:60,1', 'uses' => 'PublicRegistrationController@register']);

    // Public event registration (rate limited: 60 requests per minute)
    $router->get('public/events/{code}', 'EventController@publicShow');
    $router->post('public/events/{code}/check-face', ['middleware' => 'throttle:60,1', 'uses' => 'EventController@publicCheckFace']);
    $router->post('public/events/{code}/register', ['middleware' => 'throttle:60,1', 'uses' => 'EventController@publicRegister']);

    // Public games registration & scan (rate limited: 60 requests per minute)
    $router->get('games/register/{token}', 'GamesPublicController@getGroupInfo');
    $router->post('games/register/{token}', ['middleware' => 'throttle:60,1', 'uses' => 'GamesPublicController@register']);
    $router->post('games/scan-point', ['middleware' => 'throttle:60,1', 'uses' => 'GamesPublicController@scanPoint']);

    // Public guest visit kiosk (rate limited: 60 requests per minute)
    $router->post('public/check-face', ['middleware' => 'throttle:60,1', 'uses' => 'VisitController@publicCheckFace']);
    $router->post('public/guest-visit', ['middleware' => 'throttle:60,1', 'uses' => 'VisitController@publicGuestVisit']);

    // Public Pre-Registration (Face Biometric Auto-Approved Reservations)
    $router->get('public/reservations/{token}', 'PublicReservationController@getInvitation');
    $router->post('public/reservations/{token}/check-face', ['middleware' => 'throttle:60,1', 'uses' => 'PublicReservationController@checkFace']);
    $router->post('public/reservations/{token}/submit', ['middleware' => 'throttle:60,1', 'uses' => 'PublicReservationController@submitReservation']);
    $router->post('public/reservations/auto-checkin', ['middleware' => 'throttle:60,1', 'uses' => 'PublicReservationController@autoCheckIn']);
    

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

    // Visitors
    $router->get('visitors', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitorController@index']);
    $router->post('visitors', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitorController@store']);
    $router->get('visitors/{id}', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitorController@show']);
    $router->put('visitors/{id}', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitorController@update']);
    $router->post('visitors/{id}', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitorController@update']);
    $router->delete('visitors/{id}', ['middleware' => 'role:admin', 'uses' => 'VisitorController@destroy']);

    // Face Embeddings
    $router->get('face-embeddings', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'FaceEmbeddingController@index']);
    $router->post('face-embeddings/check-duplicate', 'FaceEmbeddingController@checkDuplicate');
    $router->post('visitors/{visitorId}/face-embedding', 'FaceEmbeddingController@store');
    $router->delete('visitors/{visitorId}/face-embedding', ['middleware' => 'role:admin', 'uses' => 'FaceEmbeddingController@destroy']);

    // Visits (ownership handled in controller)
    $router->get('visits', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitController@index']);
    $router->get('visits/active', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitController@active']);
    $router->get('visits/history', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitController@history']);
    $router->post('visits', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitController@store']);
    $router->get('visits/{id}', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitController@show']);
    $router->put('visits/{id}/checkout', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'VisitController@checkout']);
    $router->delete('visits/{id}', ['middleware' => 'role:admin,receptionist', 'uses' => 'VisitController@destroy']);

    // Reservation Invitations & Pre-Registration Management
    $router->get('reservations/stats', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'ReservationInvitationController@stats']);
    $router->get('reservations/invitations', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'ReservationInvitationController@index']);
    $router->post('reservations/invitations', ['middleware' => 'role:admin,receptionist', 'uses' => 'ReservationInvitationController@store']);
    $router->get('reservations/invitations/{id}', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'ReservationInvitationController@show']);
    $router->put('reservations/invitations/{id}', ['middleware' => 'role:admin,receptionist', 'uses' => 'ReservationInvitationController@update']);
    $router->put('reservations/invitations/{id}/toggle-status', ['middleware' => 'role:admin,receptionist', 'uses' => 'ReservationInvitationController@toggleStatus']);
    $router->delete('reservations/invitations/{id}', ['middleware' => 'role:admin,receptionist', 'uses' => 'ReservationInvitationController@destroy']);
    $router->get('reservations', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'ReservationInvitationController@reservationsList']);
    $router->get('reservations/{id}', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'ReservationInvitationController@reservationDetail']);
    $router->delete('reservations/{id}', ['middleware' => 'role:admin,receptionist', 'uses' => 'ReservationInvitationController@destroyReservation']);

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
    
    // Reports - Admin, Receptionist, Supervisor
    $router->get('reports/statistics', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'ReportController@statistics']);
    $router->get('reports/export-excel', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'ReportController@exportExcel']);
    $router->get('reports/export-pdf', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'ReportController@exportPdf']);

    // Event Reports - Admin, Receptionist, Supervisor
    $router->get('reports/events', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'EventController@eventReport']);
    $router->get('reports/events/export-excel', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'EventController@exportExcel']);
    $router->get('reports/events/export-pdf', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'EventController@exportPdf']);

    // Events - IMPORTANT: specific routes BEFORE dynamic {id} route
    $router->get('events/active', ['middleware' => 'role:admin,receptionist', 'uses' => 'EventController@activeEvents']);
    $router->get('events', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'EventController@index']);
    $router->post('events', ['middleware' => 'role:admin,receptionist', 'uses' => 'EventController@store']);
    $router->get('events/{id}', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'EventController@show']);
    $router->put('events/{id}', ['middleware' => 'role:admin,receptionist', 'uses' => 'EventController@update']);
    $router->delete('events/{id}', ['middleware' => 'role:admin,receptionist', 'uses' => 'EventController@destroy']);

    // Event participants
    $router->get('events/{id}/participants', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'EventController@participants']);
    $router->post('events/{id}/participants', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'EventController@storeParticipant']);
    $router->post('events/{id}/participants/{participantId}/check-in', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'EventController@checkInParticipant']);
    $router->post('events/{id}/participants/{participantId}/check-out', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'EventController@checkOutParticipant']);
    $router->delete('events/{id}/participants/{participantId}', ['middleware' => 'role:admin,receptionist', 'uses' => 'EventController@destroyParticipant']);

    // Single event export
    $router->get('events/{id}/export-excel', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'EventController@exportEventExcel']);
    $router->get('events/{id}/export-pdf', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'EventController@exportEventPdf']);

    // ========== GAMES EVENT ROUTES ==========
    $router->group(['prefix' => 'games/events'], function () use ($router) {
        // Read-only routes (Admin, Receptionist, Supervisor)
        $router->get('/', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'GameEventController@index']);
        $router->get('/event-link/{eventId}', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'GameEventController@getByEventId']);
        $router->post('/event-link/{eventId}', ['middleware' => 'role:admin,receptionist', 'uses' => 'GameEventController@linkToEvent']);
        $router->get('/{id}', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'GameEventController@show']);
        $router->get('/{id}/groups', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'GameEventController@groups']);
        $router->get('/{id}/groups/{groupId}/participants', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'GameEventController@groupParticipants']);
        $router->post('/{id}/groups/{groupId}/participants', ['middleware' => 'role:admin,receptionist', 'uses' => 'GameEventController@storeParticipant']);
        $router->delete('/{id}/groups/{groupId}/participants/{participantId}', ['middleware' => 'role:admin,receptionist', 'uses' => 'GameEventController@destroyParticipant']);
        $router->get('/{id}/point-qr', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'PointQrCodeController@index']);
        $router->get('/{id}/point-qr/{qrId}/generate', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'PointQrCodeController@generateQr']);
        $router->get('/{id}/dashboard/stats', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'GamesDashboardController@stats']);
        $router->get('/{id}/dashboard/group-rankings', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'GamesDashboardController@groupRankings']);
        $router->get('/{id}/dashboard/participant-rankings', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'GamesDashboardController@participantRankings']);
        $router->get('/{id}/dashboard/point-distribution', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'GamesDashboardController@pointDistribution']);
        $router->get('/{id}/transactions', ['middleware' => 'role:admin,receptionist,supervisor', 'uses' => 'GamesDashboardController@transactions']);

        // Write routes (Admin & Receptionist only)
        $router->post('/', ['middleware' => 'role:admin,receptionist', 'uses' => 'GameEventController@store']);
        $router->put('/{id}', ['middleware' => 'role:admin,receptionist', 'uses' => 'GameEventController@update']);
        $router->delete('/{id}', ['middleware' => 'role:admin,receptionist', 'uses' => 'GameEventController@destroy']);

        // Groups management (Admin & Receptionist only)
        $router->post('/{id}/groups', ['middleware' => 'role:admin,receptionist', 'uses' => 'GameEventController@storeGroup']);
        $router->put('/{id}/groups/{groupId}', ['middleware' => 'role:admin,receptionist', 'uses' => 'GameEventController@updateGroup']);
        $router->delete('/{id}/groups/{groupId}', ['middleware' => 'role:admin,receptionist', 'uses' => 'GameEventController@destroyGroup']);
        $router->get('/{id}/groups/{groupId}/qr', ['middleware' => 'role:admin,receptionist', 'uses' => 'GameEventController@generateGroupQr']);

        // Point QR Codes (Admin & Receptionist only)
        $router->post('/{id}/point-qr', ['middleware' => 'role:admin,receptionist', 'uses' => 'PointQrCodeController@store']);
        $router->put('/{id}/point-qr/{qrId}/status', ['middleware' => 'role:admin,receptionist', 'uses' => 'PointQrCodeController@updateStatus']);
        $router->delete('/{id}/point-qr/{qrId}', ['middleware' => 'role:admin,receptionist', 'uses' => 'PointQrCodeController@destroy']);

        // Export (Admin & Receptionist only)
        $router->get('/{id}/transactions/export', ['middleware' => 'role:admin,receptionist', 'uses' => 'GamesDashboardController@exportTransactions']);
    });
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
