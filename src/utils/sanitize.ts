/**
 * Utilidades de sanitización de inputs
 * Soluciona: Inyección de datos maliciosos, XSS
 */

/**
 * Sanitiza un string removiendo caracteres potencialmente peligrosos
 * @param input - String a sanitizar
 * @param maxLength - Longitud máxima permitida
 * @returns String sanitizado
 */
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+\s*=/gi, ''); // Remover event handlers (onclick=, onerror=, etc.)
};

/**
 * Sanitiza un objeto validando tipos según esquema
 * @param obj - Objeto a sanitizar
 * @param schema - Esquema de tipos esperados
 * @returns Objeto sanitizado
 */
export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'array'>
): Partial<T> => {
  const sanitized: any = {};

  Object.keys(schema).forEach(key => {
    const value = obj[key];
    const type = schema[key];

    switch (type) {
      case 'string':
        sanitized[key] = typeof value === 'string' ? sanitizeInput(value) : '';
        break;

      case 'number':
        const num = typeof value === 'number' ? value : parseFloat(value);
        sanitized[key] = isNaN(num) ? 0 : num;
        break;

      case 'boolean':
        sanitized[key] = Boolean(value);
        break;

      case 'array':
        sanitized[key] = Array.isArray(value) ? value : [];
        break;

      default:
        sanitized[key] = value;
    }
  });

  return sanitized as Partial<T>;
};

/**
 * Sanitiza nombre (solo letras y espacios)
 */
export const sanitizeName = (name: string): string => {
  return name
    .trim()
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
    .slice(0, 50);
};

/**
 * Sanitiza número de teléfono (solo dígitos)
 */
export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '').slice(0, 15);
};

/**
 * Sanitiza email
 */
export const sanitizeEmail = (email: string): string => {
  return email
    .trim()
    .toLowerCase()
    .slice(0, 100);
};

/**
 * Sanitiza referencia bancaria (alfanuméricos y guiones)
 */
export const sanitizeReference = (reference: string): string => {
  return reference
    .trim()
    .replace(/[^a-zA-Z0-9\-]/g, '')
    .slice(0, 50);
};

/**
 * Sanitiza notas/comentarios
 */
export const sanitizeNotes = (notes: string): string => {
  return sanitizeInput(notes, 500);
};

/**
 * Sanitiza URL
 */
export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Solo permitir http y https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
};