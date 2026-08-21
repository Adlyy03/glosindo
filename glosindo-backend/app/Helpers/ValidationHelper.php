<?php

namespace App\Helpers;

class ValidationHelper
{
    /**
     * Validate and normalize Indonesian phone number.
     * 
     * Accepted formats:
     * - 08xxxxxxxxxx (10-13 digits)
     * - +628xxxxxxxxxx
     * - 628xxxxxxxxxx
     * - 8xxxxxxxxxx
     * 
     * @param string $phone
     * @return array ['valid' => bool, 'normalized' => string|null, 'message' => string|null]
     */
    public static function validatePhone($phone)
    {
        if (empty($phone)) {
            return [
                'valid' => false,
                'normalized' => null,
                'message' => 'Nomor telepon wajib diisi',
            ];
        }

        // Remove spaces, dashes, parentheses
        $cleaned = preg_replace('/[\s\-\(\)]/', '', $phone);

        // Check patterns
        $patterns = [
            '/^08\d{8,11}$/',      // 08xxxxxxxxxx
            '/^\+628\d{8,11}$/',   // +628xxxxxxxxxx
            '/^628\d{8,11}$/',     // 628xxxxxxxxxx
            '/^8\d{8,11}$/',       // 8xxxxxxxxxx
        ];

        $isValid = false;
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $cleaned)) {
                $isValid = true;
                break;
            }
        }

        if (!$isValid) {
            return [
                'valid' => false,
                'normalized' => null,
                'message' => 'Format nomor telepon tidak valid. Gunakan format: 08xxxxxxxxxx',
            ];
        }

        return [
            'valid' => true,
            'normalized' => self::normalizePhone($cleaned),
            'message' => null,
        ];
    }

    /**
     * Normalize phone number to 08xxxxxxxxxx format.
     * 
     * @param string $phone
     * @return string
     */
    public static function normalizePhone($phone)
    {
        if (empty($phone)) {
            return '';
        }

        $cleaned = preg_replace('/[\s\-\(\)]/', '', $phone);

        // +628xxx -> 08xxx
        if (strpos($cleaned, '+62') === 0) {
            return '0' . substr($cleaned, 3);
        }

        // 628xxx -> 08xxx
        if (strpos($cleaned, '62') === 0) {
            return '0' . substr($cleaned, 2);
        }

        // 8xxx -> 08xxx
        if (strpos($cleaned, '8') === 0 && strpos($cleaned, '08') !== 0) {
            return '0' . $cleaned;
        }

        return $cleaned;
    }

    /**
     * Custom phone validation rule for Lumen/Laravel.
     * 
     * Usage in controller:
     * $this->validate($request, [
     *     'phone' => ['required', function($attribute, $value, $fail) {
     *         $result = ValidationHelper::validatePhone($value);
     *         if (!$result['valid']) {
     *             $fail($result['message']);
     *         }
     *     }],
     * ]);
     */
    public static function phoneRule()
    {
        return function ($attribute, $value, $fail) {
            $result = self::validatePhone($value);
            if (!$result['valid']) {
                $fail($result['message']);
            }
        };
    }
}
