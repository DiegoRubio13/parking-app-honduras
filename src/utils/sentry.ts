import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

/**
 * Sentry configuration and utilities for error monitoring
 *
 * To use Sentry in production:
 * 1. Sign up at https://sentry.io
 * 2. Create a new React Native project
 * 3. Replace SENTRY_DSN in .env files with your actual DSN
 * 4. Run: npx @sentry/wizard -i reactNative -p ios android
 */

const SENTRY_DSN = process.env.SENTRY_DSN || '';
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const IS_DEVELOPMENT = __DEV__;

/**
 * Initialize Sentry
 */
export const initSentry = () => {
  // Only initialize Sentry in production with a valid DSN
  if (!IS_DEVELOPMENT && SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,

      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of transactions in production

      // Release tracking
      release: `parking-app@1.0.0`,
      dist: Platform.OS,

      // Integrations
      integrations: [
        new Sentry.ReactNativeTracing({
          tracingOrigins: ['localhost', /^\//],
          routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
        }),
      ],

      // Error filtering
      beforeSend(event, hint) {
        // Filter out development errors
        if (IS_DEVELOPMENT) {
          return null;
        }

        // Filter out network errors that are expected
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = String(error.message).toLowerCase();
          if (
            errorMessage.includes('network request failed') ||
            errorMessage.includes('timeout')
          ) {
            // Log locally but don't send to Sentry
            console.warn('Network error filtered from Sentry:', error);
            return null;
          }
        }

        return event;
      },

      // Enable debug in development
      debug: IS_DEVELOPMENT,

      // Disable in development to avoid noise
      enabled: !IS_DEVELOPMENT && !!SENTRY_DSN,
    });

    console.log('Sentry initialized for environment:', ENVIRONMENT);
  } else {
    console.log('Sentry not initialized (development mode or missing DSN)');
  }
};

/**
 * Capture an exception
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (IS_DEVELOPMENT) {
    console.error('Error (not sent to Sentry):', error, context);
    return;
  }

  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
};

/**
 * Capture a message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) => {
  if (IS_DEVELOPMENT) {
    console.log(`Message (${level}, not sent to Sentry):`, message, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    contexts: context ? { custom: context } : undefined,
  });
};

/**
 * Set user context
 */
export const setUser = (user: {
  id?: string;
  email?: string;
  username?: string;
  phone?: string;
  role?: string;
}) => {
  Sentry.setUser(user);
};

/**
 * Clear user context
 */
export const clearUser = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (
  message: string,
  category?: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Set custom context
 */
export const setContext = (name: string, context: Record<string, any>) => {
  Sentry.setContext(name, context);
};

/**
 * Set tag
 */
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Start a transaction for performance monitoring
 */
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Wrap async function with error handling
 */
export const wrapAsync = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage?: string
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        captureException(error, {
          function: fn.name,
          arguments: args,
          customMessage: errorMessage,
        });
      }
      throw error;
    }
  }) as T;
};

/**
 * Error boundary fallback component props
 */
export interface ErrorBoundaryProps {
  error: Error;
  componentStack: string;
  resetError: () => void;
}

/**
 * Create error boundary wrapper
 */
export const createErrorBoundary = (
  FallbackComponent: React.ComponentType<ErrorBoundaryProps>
) => {
  return Sentry.withErrorBoundary(FallbackComponent, {
    showDialog: false,
    fallback: FallbackComponent as any,
  });
};

/**
 * Log levels for structured logging
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Structured logging utility
 */
export const logger = {
  debug: (message: string, data?: Record<string, any>) => {
    if (IS_DEVELOPMENT) {
      console.debug(message, data);
    }
    addBreadcrumb(message, 'debug', 'debug', data);
  },

  info: (message: string, data?: Record<string, any>) => {
    console.info(message, data);
    addBreadcrumb(message, 'info', 'info', data);
  },

  warning: (message: string, data?: Record<string, any>) => {
    console.warn(message, data);
    addBreadcrumb(message, 'warning', 'warning', data);
    if (!IS_DEVELOPMENT) {
      captureMessage(message, 'warning', data);
    }
  },

  error: (message: string, error?: Error, data?: Record<string, any>) => {
    console.error(message, error, data);
    if (error) {
      captureException(error, { message, ...data });
    } else {
      captureMessage(message, 'error', data);
    }
  },

  fatal: (message: string, error: Error, data?: Record<string, any>) => {
    console.error('[FATAL]', message, error, data);
    captureException(error, { message, level: 'fatal', ...data });
  },
};

/**
 * Performance monitoring utilities
 */
export const performance = {
  /**
   * Measure operation performance
   */
  measure: async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const transaction = startTransaction(operationName, 'operation');
    const startTime = Date.now();

    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      addBreadcrumb(
        `Operation ${operationName} completed`,
        'performance',
        'info',
        { duration }
      );

      transaction.finish();
      return result;
    } catch (error) {
      transaction.setStatus('internal_error');
      transaction.finish();
      throw error;
    }
  },

  /**
   * Track screen load time
   */
  trackScreenLoad: (screenName: string, loadTime: number) => {
    addBreadcrumb(
      `Screen ${screenName} loaded`,
      'navigation',
      'info',
      { loadTime }
    );
    setTag('screen', screenName);
  },
};

export default {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  setContext,
  setTag,
  startTransaction,
  wrapAsync,
  createErrorBoundary,
  logger,
  performance,
};