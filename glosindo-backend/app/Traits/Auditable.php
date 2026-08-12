<?php

namespace App\Traits;

use App\Models\AuditLog;

trait Auditable
{
    /**
     * Log an audit entry.
     *
     * @param string $action
     * @param array|null $oldValues
     * @param array|null $newValues
     * @param string|null $description
     * @return void
     */
    public function audit(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $description = null)
    {
        $user = auth()->user();
        $request = app('request');

        AuditLog::create([
            'user_id' => $user ? $user->id : null,
            'action' => $action,
            'model_type' => get_class($this),
            'model_id' => $this->id ?? null,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }

    /**
     * Get audit logs for this model.
     */
    public function auditLogs()
    {
        return $this->morphMany(AuditLog::class, 'model', 'model_type', 'model_id');
    }
}
