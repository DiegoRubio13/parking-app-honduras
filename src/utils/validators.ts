/**
 * Validadores reutilizables para inputs
 * Soluciona: Validaciones faltantes, formatos incorrectos
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validators = {
  /**
   * Valida número de teléfono internacional
   */
  phone: (phone: string): ValidationResult => {
    const cleaned = phone.trim().replace(/\D/g, '');

    if (cleaned.length === 0) {
      return { valid: false, error: 'Número de teléfono requerido' };
    }

    if (cleaned.length < 8) {
      return { valid: false, error: 'Número muy corto (mínimo 8 dígitos)' };
    }

    if (cleaned.length > 15) {
      return { valid: false, error: 'Número muy largo (máximo 15 dígitos)' };
    }

    return { valid: true };
  },

  /**
   * Valida formato de email
   */
  email: (email: string): ValidationResult => {
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (trimmed.length === 0) {
      return { valid: false, error: 'Email requerido' };
    }

    if (!emailRegex.test(trimmed)) {
      return { valid: false, error: 'Formato de email inválido' };
    }

    if (trimmed.length > 100) {
      return { valid: false, error: 'Email muy largo' };
    }

    return { valid: true };
  },

  /**
   * Valida nombre completo
   */
  name: (name: string): ValidationResult => {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
      return { valid: false, error: 'Nombre requerido' };
    }

    if (trimmed.length < 2) {
      return { valid: false, error: 'Nombre muy corto (mínimo 2 caracteres)' };
    }

    if (trimmed.length > 50) {
      return { valid: false, error: 'Nombre muy largo (máximo 50 caracteres)' };
    }

    // Permitir letras, espacios y acentos
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(trimmed)) {
      return { valid: false, error: 'Nombre solo puede contener letras' };
    }

    return { valid: true };
  },

  /**
   * Valida código de verificación SMS
   */
  verificationCode: (code: string): ValidationResult => {
    const cleaned = code.replace(/\D/g, '');

    if (cleaned.length === 0) {
      return { valid: false, error: 'Código requerido' };
    }

    if (cleaned.length !== 6) {
      return { valid: false, error: 'Código debe tener 6 dígitos' };
    }

    return { valid: true };
  },

  /**
   * Valida monto de dinero
   */
  amount: (amount: number | string): ValidationResult => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
      return { valid: false, error: 'Monto inválido' };
    }

    if (numAmount <= 0) {
      return { valid: false, error: 'Monto debe ser mayor a 0' };
    }

    if (numAmount > 1000000) {
      return { valid: false, error: 'Monto excede el máximo permitido' };
    }

    return { valid: true };
  },

  /**
   * Valida número de referencia bancaria
   */
  reference: (reference: string): ValidationResult => {
    const trimmed = reference.trim();

    if (trimmed.length === 0) {
      return { valid: false, error: 'Referencia requerida' };
    }

    if (trimmed.length < 4) {
      return { valid: false, error: 'Referencia muy corta (mínimo 4 caracteres)' };
    }

    if (trimmed.length > 50) {
      return { valid: false, error: 'Referencia muy larga (máximo 50 caracteres)' };
    }

    // Permitir solo alfanuméricos y guiones
    if (!/^[a-zA-Z0-9\-]+$/.test(trimmed)) {
      return { valid: false, error: 'Referencia solo puede contener letras, números y guiones' };
    }

    return { valid: true };
  },

  /**
   * Valida notas/comentarios
   */
  notes: (notes: string): ValidationResult => {
    const trimmed = notes.trim();

    if (trimmed.length > 500) {
      return { valid: false, error: 'Notas muy largas (máximo 500 caracteres)' };
    }

    return { valid: true };
  },

  /**
   * Valida duración en minutos
   */
  duration: (minutes: number): ValidationResult => {
    if (!Number.isInteger(minutes)) {
      return { valid: false, error: 'Duración debe ser un número entero' };
    }

    if (minutes < 0) {
      return { valid: false, error: 'Duración no puede ser negativa' };
    }

    if (minutes > 1440) {
      return { valid: false, error: 'Duración excede el máximo (24 horas)' };
    }

    return { valid: true };
  },

  /**
   * Valida placa de vehículo
   */
  licensePlate: (plate: string): ValidationResult => {
    const trimmed = plate.trim().toUpperCase();

    if (trimmed.length === 0) {
      return { valid: false, error: 'Placa requerida' };
    }

    if (trimmed.length < 4) {
      return { valid: false, error: 'Placa muy corta' };
    }

    if (trimmed.length > 10) {
      return { valid: false, error: 'Placa muy larga' };
    }

    // Permitir letras, números y guiones
    if (!/^[A-Z0-9\-]+$/.test(trimmed)) {
      return { valid: false, error: 'Placa solo puede contener letras, números y guiones' };
    }

    return { valid: true };
  },
};

/**
 * Valida múltiples campos a la vez
 */
export const validateFields = (
  fields: Record<string, any>,
  rules: Record<string, keyof typeof validators>
): Record<string, string | undefined> => {
  const errors: Record<string, string | undefined> = {};

  Object.keys(rules).forEach(fieldName => {
    const validatorKey = rules[fieldName];
    const validator = validators[validatorKey];

    if (validator) {
      const result = validator(fields[fieldName]);
      if (!result.valid) {
        errors[fieldName] = result.error;
      }
    }
  });

  return errors;
};