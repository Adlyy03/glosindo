<?php

namespace App\Http\Middleware;

use Closure;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $envOrigins = array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGIN', ''))));
        $allowedOrigins = array_merge([
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://103.134.221.200',
            'http://103.134.221.200:80',
            'http://103.134.221.201',
        ], $envOrigins);

        $origin = $request->header('Origin');

        if ($origin && (in_array($origin, $allowedOrigins) || preg_match('/^https?:\/\/(localhost|127\.0\.0\.1|103\.134\.221\.\d+|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/', $origin))) {
            $allowOrigin = $origin;
        } else {
            $allowOrigin = !empty($envOrigins) ? reset($envOrigins) : 'http://103.134.221.200';
        }

        $headers = [
            'Access-Control-Allow-Origin'      => $allowOrigin,
            'Access-Control-Allow-Methods'     => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Max-Age'           => '86400',
            'Access-Control-Allow-Headers'     => 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Custom-Header'
        ];

        // Handle preflight OPTIONS request
        if ($request->isMethod('OPTIONS')) {
            return response('', 200, $headers);
        }

        $response = $next($request);

        if ($response) {
            foreach ($headers as $key => $value) {
                $response->headers->set($key, $value);
            }
        }

        return $response;
    }
}