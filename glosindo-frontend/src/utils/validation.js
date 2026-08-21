/**
 * Centralized validation utilities
 */

/**
 * Indonesia phone number validation
 * Formats accepted:
 * - 08xxxxxxxxxx (10-13 digits)
 * - +628xxxxxxxxxx
 * - 628xxxxxxxxxx
 * - 8xxxxxxxxxx
 */
export const validatePhone = (phone) => {
  if (!phone) return { valid: false, message: 'Nomor telepon wajib diisi' };
  
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check patterns
  const patterns = [
    /^08\d{8,11}$/,           // 08xxxxxxxxxx
    /^\+628\d{8,11}$/,        // +628xxxxxxxxxx
    /^628\d{8,11}$/,          // 628xxxxxxxxxx
    /^8\d{8,11}$/,            // 8xxxxxxxxxx
  ];
  
  const isValid = patterns.some(pattern => pattern.test(cleaned));
  
  if (!isValid) {
    return {
      valid: false,
      message: 'Format nomor telepon tidak valid. Gunakan format: 08xxxxxxxxxx',
    };
  }
  
  return { valid: true, normalized: normalizePhone(cleaned) };
};

/**
 * Normalize phone to 08xxxxxxxxxx format
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // +628xxx -> 08xxx
  if (cleaned.startsWith('+62')) {
    return '0' + cleaned.slice(3);
  }
  
  // 628xxx -> 08xxx
  if (cleaned.startsWith('62')) {
    return '0' + cleaned.slice(2);
  }
  
  // 8xxx -> 08xxx
  if (cleaned.startsWith('8') && !cleaned.startsWith('08')) {
    return '0' + cleaned;
  }
  
  return cleaned;
};

/**
 * Email validation
 */
export const validateEmail = (email) => {
  if (!email) return { valid: true }; // Email optional in most forms
  
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!pattern.test(email)) {
    return {
      valid: false,
      message: 'Format email tidak valid',
    };
  }
  
  return { valid: true };
};

/**
 * Name validation
 */
export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Nama wajib diisi' };
  }
  
  if (name.trim().length < 3) {
    return { valid: false, message: 'Nama minimal 3 karakter' };
  }
  
  if (name.length > 255) {
    return { valid: false, message: 'Nama maksimal 255 karakter' };
  }
  
  return { valid: true };
};

/**
 * Required field validation
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { valid: false, message: `${fieldName} wajib diisi` };
  }
  return { valid: true };
};

/**
 * Validate form data
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required) {
      const result = validateRequired(value, rule.label || field);
      if (!result.valid) {
        errors[field] = result.message;
        return;
      }
    }
    
    if (rule.type === 'phone') {
      const result = validatePhone(value);
      if (!result.valid) {
        errors[field] = result.message;
      }
    }
    
    if (rule.type === 'email' && value) {
      const result = validateEmail(value);
      if (!result.valid) {
        errors[field] = result.message;
      }
    }
    
    if (rule.type === 'name') {
      const result = validateName(value);
      if (!result.valid) {
        errors[field] = result.message;
      }
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${rule.label || field} minimal ${rule.minLength} karakter`;
    }
    
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${rule.label || field} maksimal ${rule.maxLength} karakter`;
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validatePhone,
  normalizePhone,
  validateEmail,
  validateName,
  validateRequired,
  validateForm,
};
