/**
 * Network Helpers - Timeout y utilidades de red
 * Soluciona: Loading indefinido, operaciones sin timeout
 */

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Ejecuta una promesa con timeout
 * @param promise - Promesa a ejecutar
 * @param timeoutMs - Tiempo límite en milisegundos
 * @param errorMessage - Mensaje de error personalizado
 */
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 15000,
  errorMessage: string = 'La operación tardó demasiado. Verifica tu conexión.'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new TimeoutError(errorMessage)), timeoutMs)
    ),
  ]);
};

/**
 * Reintentar operación con backoff exponencial
 * @param operation - Función que retorna una promesa
 * @param maxRetries - Número máximo de reintentos
 * @param initialDelayMs - Delay inicial en milisegundos
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // No reintentar errores de validación o permisos
      if (
        error.code?.includes('invalid') ||
        error.code?.includes('permission') ||
        error.code?.includes('not-found') ||
        error instanceof TimeoutError
      ) {
        throw error;
      }

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries - 1) {
        const delay = initialDelayMs * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

/**
 * Ejecuta operación con timeout Y retry
 */
export const executeWithTimeoutAndRetry = async <T>(
  operation: () => Promise<T>,
  timeoutMs: number = 15000,
  maxRetries: number = 3
): Promise<T> => {
  return retryWithBackoff(
    () => withTimeout(operation(), timeoutMs),
    maxRetries
  );
};