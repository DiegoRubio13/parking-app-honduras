export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validation utility class with common validation rules
 */
class Validator {
  /**
   * Email validation
   */
  static email(value: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);

    return {
      isValid,
      errors: isValid ? [] : ['Please enter a valid email address']
    };
  }

  /**
   * Phone number validation (international format)
   */
  static phone(value: string): ValidationResult {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    const isValid = cleaned.length >= 10 && cleaned.length <= 15;

    return {
      isValid,
      errors: isValid ? [] : ['Please enter a valid phone number']
    };
  }

  /**
   * Password validation
   */
  static password(value: string, minLength: number = 6): ValidationResult {
    const errors: string[] = [];

    if (value.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters`);
    }

    if (!/[A-Z]/.test(value)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(value)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(value)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Simple password validation (less strict)
   */
  static simplePassword(value: string, minLength: number = 6): ValidationResult {
    const isValid = value.length >= minLength;

    return {
      isValid,
      errors: isValid ? [] : [`Password must be at least ${minLength} characters`]
    };
  }

  /**
   * Required field validation
   */
  static required(value: any, fieldName: string = 'This field'): ValidationResult {
    const isValid = value !== null && value !== undefined && value !== '';

    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} is required`]
    };
  }

  /**
   * Minimum length validation
   */
  static minLength(value: string, min: number, fieldName: string = 'This field'): ValidationResult {
    const isValid = value.length >= min;

    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} must be at least ${min} characters`]
    };
  }

  /**
   * Maximum length validation
   */
  static maxLength(value: string, max: number, fieldName: string = 'This field'): ValidationResult {
    const isValid = value.length <= max;

    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} must be no more than ${max} characters`]
    };
  }

  /**
   * Numeric validation
   */
  static numeric(value: string): ValidationResult {
    const isValid = /^\d+$/.test(value);

    return {
      isValid,
      errors: isValid ? [] : ['Please enter only numbers']
    };
  }

  /**
   * Alphanumeric validation
   */
  static alphanumeric(value: string): ValidationResult {
    const isValid = /^[a-zA-Z0-9]+$/.test(value);

    return {
      isValid,
      errors: isValid ? [] : ['Please enter only letters and numbers']
    };
  }

  /**
   * License plate validation (customizable format)
   */
  static licensePlate(value: string): ValidationResult {
    // Basic format: 3-8 alphanumeric characters with optional dash/space
    const cleaned = value.replace(/[-\s]/g, '');
    const isValid = /^[A-Z0-9]{3,8}$/i.test(cleaned);

    return {
      isValid,
      errors: isValid ? [] : ['Please enter a valid license plate']
    };
  }

  /**
   * Credit card validation (Luhn algorithm)
   */
  static creditCard(value: string): ValidationResult {
    const cleaned = value.replace(/\s/g, '');

    if (!/^\d{13,19}$/.test(cleaned)) {
      return {
        isValid: false,
        errors: ['Please enter a valid credit card number']
      };
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    const isValid = sum % 10 === 0;

    return {
      isValid,
      errors: isValid ? [] : ['Invalid credit card number']
    };
  }

  /**
   * CVV validation
   */
  static cvv(value: string): ValidationResult {
    const isValid = /^\d{3,4}$/.test(value);

    return {
      isValid,
      errors: isValid ? [] : ['Please enter a valid CVV (3 or 4 digits)']
    };
  }

  /**
   * Date validation
   */
  static date(value: Date | string): ValidationResult {
    const date = typeof value === 'string' ? new Date(value) : value;
    const isValid = date instanceof Date && !isNaN(date.getTime());

    return {
      isValid,
      errors: isValid ? [] : ['Please enter a valid date']
    };
  }

  /**
   * Date range validation
   */
  static dateRange(startDate: Date | string, endDate: Date | string): ValidationResult {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    const isValidStart = start instanceof Date && !isNaN(start.getTime());
    const isValidEnd = end instanceof Date && !isNaN(end.getTime());

    if (!isValidStart || !isValidEnd) {
      return {
        isValid: false,
        errors: ['Please enter valid dates']
      };
    }

    const isValid = start <= end;

    return {
      isValid,
      errors: isValid ? [] : ['Start date must be before end date']
    };
  }

  /**
   * URL validation
   */
  static url(value: string): ValidationResult {
    try {
      new URL(value);
      return {
        isValid: true,
        errors: []
      };
    } catch {
      return {
        isValid: false,
        errors: ['Please enter a valid URL']
      };
    }
  }

  /**
   * Custom validation with multiple rules
   */
  static custom(value: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate multiple fields
   */
  static validateForm(fields: Record<string, { value: any; rules: ValidationRule[] }>): {
    isValid: boolean;
    errors: Record<string, string[]>;
  } {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    for (const [fieldName, fieldConfig] of Object.entries(fields)) {
      const result = this.custom(fieldConfig.value, fieldConfig.rules);
      if (!result.isValid) {
        errors[fieldName] = result.errors;
        isValid = false;
      }
    }

    return { isValid, errors };
  }
}

/**
 * Common validation rules that can be reused
 */
export const validationRules = {
  required: (fieldName: string = 'This field'): ValidationRule => ({
    validate: (value: any) => value !== null && value !== undefined && value !== '',
    message: `${fieldName} is required`
  }),

  minLength: (min: number, fieldName: string = 'This field'): ValidationRule => ({
    validate: (value: string) => value.length >= min,
    message: `${fieldName} must be at least ${min} characters`
  }),

  maxLength: (max: number, fieldName: string = 'This field'): ValidationRule => ({
    validate: (value: string) => value.length <= max,
    message: `${fieldName} must be no more than ${max} characters`
  }),

  email: (): ValidationRule => ({
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  }),

  phone: (): ValidationRule => ({
    validate: (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 15;
    },
    message: 'Please enter a valid phone number'
  }),

  numeric: (): ValidationRule => ({
    validate: (value: string) => /^\d+$/.test(value),
    message: 'Please enter only numbers'
  }),

  alphanumeric: (): ValidationRule => ({
    validate: (value: string) => /^[a-zA-Z0-9]+$/.test(value),
    message: 'Please enter only letters and numbers'
  }),

  min: (min: number, fieldName: string = 'Value'): ValidationRule => ({
    validate: (value: number) => value >= min,
    message: `${fieldName} must be at least ${min}`
  }),

  max: (max: number, fieldName: string = 'Value'): ValidationRule => ({
    validate: (value: number) => value <= max,
    message: `${fieldName} must be no more than ${max}`
  }),

  match: (compareValue: any, fieldName: string = 'Values'): ValidationRule => ({
    validate: (value: any) => value === compareValue,
    message: `${fieldName} do not match`
  })
};

export default Validator;