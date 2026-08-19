<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Laravel\Lumen\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontReport = [
        AuthorizationException::class,
        HttpException::class,
        ModelNotFoundException::class,
        ValidationException::class,
    ];

    public function report(Throwable $exception)
    {
        parent::report($exception);
    }

    public function render($request, Throwable $exception)
    {
        // JWT token errors
        if ($exception instanceof TokenExpiredException) {
            return response()->json(['success' => false, 'message' => 'Token expired'], 401);
        }
        if ($exception instanceof TokenInvalidException) {
            return response()->json(['success' => false, 'message' => 'Token invalid'], 401);
        }
        if ($exception instanceof JWTException) {
            return response()->json(['success' => false, 'message' => 'Token not provided'], 401);
        }

        // Unauthorized (401)
        if ($exception instanceof UnauthorizedHttpException) {
            return response()->json(['success' => false, 'message' => $exception->getMessage() ?: 'Unauthorized'], 401);
        }

        // Auth/Authorization
        if ($exception instanceof AuthorizationException) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        // Model not found (404)
        if ($exception instanceof ModelNotFoundException) {
            $model = class_basename($exception->getModel());
            return response()->json(['success' => false, 'message' => "{$model} not found"], 404);
        }

        // Validation (422)
        if ($exception instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $exception->errors(),
            ], 422);
        }

        // Generic HTTP exceptions
        if ($exception instanceof HttpException) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage() ?: 'HTTP error',
            ], $exception->getStatusCode());
        }

        // All other exceptions — return JSON, not HTML
        $status = method_exists($exception, 'getStatusCode') ? $exception->getStatusCode() : 500;
        $message = app()->environment('production')
            ? 'Server error'
            : $exception->getMessage();

        return response()->json(['success' => false, 'message' => $message], $status);
    }
}
