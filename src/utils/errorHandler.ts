import { Alert } from 'react-native';
import { FirebaseError } from 'firebase/app';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  PAYMENT = 'PAYMENT',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

class ErrorHandler {
  private errorLog: AppError[] = [];
  private maxLogSize = 50;

  /**
   * Main error handling method
   */
  handle(error: any, context?: string): AppError {
    const appError = this.parseError(error);

    // Log error
    this.logError(appError, context);

    // Show user-friendly message
    this.showErrorAlert(appError);

    return appError;
  }

  /**
   * Parse different error types into AppError format
   */
  private parseError(error: any): AppError {
    // Firebase errors
    if (error instanceof FirebaseError) {
      return this.parseFirebaseError(error);
    }

    // Network errors
    if (error.message?.includes('Network') || error.message?.includes('Failed to fetch')) {
      return {
        type: ErrorType.NETWORK,
        message: 'No internet connection. Please check your network settings.',
        timestamp: new Date()
      };
    }

    // Custom app errors
    if (error.type && Object.values(ErrorType).includes(error.type)) {
      return {
        ...error,
        timestamp: error.timestamp || new Date()
      };
    }

    // Default unknown error
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'An unexpected error occurred',
      details: error,
      timestamp: new Date()
    };
  }

  /**
   * Parse Firebase-specific errors
   */
  private parseFirebaseError(error: FirebaseError): AppError {
    const errorMessages: Record<string, { type: ErrorType; message: string }> = {
      'auth/user-not-found': {
        type: ErrorType.AUTH,
        message: 'No account found with this email.'
      },
      'auth/wrong-password': {
        type: ErrorType.AUTH,
        message: 'Incorrect password. Please try again.'
      },
      'auth/email-already-in-use': {
        type: ErrorType.AUTH,
        message: 'An account with this email already exists.'
      },
      'auth/weak-password': {
        type: ErrorType.AUTH,
        message: 'Password is too weak. Use at least 6 characters.'
      },
      'auth/invalid-email': {
        type: ErrorType.VALIDATION,
        message: 'Invalid email format.'
      },
      'auth/network-request-failed': {
        type: ErrorType.NETWORK,
        message: 'Network error. Please check your connection.'
      },
      'permission-denied': {
        type: ErrorType.PERMISSION,
        message: 'You don\'t have permission to perform this action.'
      },
      'not-found': {
        type: ErrorType.NOT_FOUND,
        message: 'The requested resource was not found.'
      },
      'unavailable': {
        type: ErrorType.SERVER,
        message: 'Service temporarily unavailable. Please try again.'
      }
    };

    const errorInfo = errorMessages[error.code] || {
      type: ErrorType.UNKNOWN,
      message: error.message
    };

    return {
      ...errorInfo,
      code: error.code,
      timestamp: new Date()
    };
  }

  /**
   * Log error to internal log
   */
  private logError(error: AppError, context?: string): void {
    const logEntry = {
      ...error,
      context
    };

    this.errorLog.unshift(logEntry);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // In production, send to error tracking service
    if (__DEV__) {
      console.error('[ErrorHandler]', context || 'Unknown context', error);
    }
  }

  /**
   * Show user-friendly alert
   */
  private showErrorAlert(error: AppError): void {
    const title = this.getErrorTitle(error.type);

    Alert.alert(
      title,
      error.message,
      [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  }

  /**
   * Get appropriate title for error type
   */
  private getErrorTitle(type: ErrorType): string {
    const titles: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: 'Connection Error',
      [ErrorType.AUTH]: 'Authentication Error',
      [ErrorType.VALIDATION]: 'Validation Error',
      [ErrorType.PERMISSION]: 'Permission Denied',
      [ErrorType.NOT_FOUND]: 'Not Found',
      [ErrorType.SERVER]: 'Server Error',
      [ErrorType.PAYMENT]: 'Payment Error',
      [ErrorType.UNKNOWN]: 'Error'
    };

    return titles[type] || 'Error';
  }

  /**
   * Create custom errors
   */
  createError(type: ErrorType, message: string, details?: any): AppError {
    return {
      type,
      message,
      details,
      timestamp: new Date()
    };
  }

  /**
   * Handle async operations with error handling
   */
  async handleAsync<T>(
    operation: () => Promise<T>,
    context?: string,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handle(error, context);
      return fallback;
    }
  }

  /**
   * Get error log (useful for debugging or support)
   */
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Silent error handling (no alert)
   */
  handleSilent(error: any, context?: string): AppError {
    const appError = this.parseError(error);
    this.logError(appError, context);
    return appError;
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Helper function for quick error handling
export const handleError = (error: any, context?: string) =>
  errorHandler.handle(error, context);

// Helper for async operations
export const handleAsync = <T>(
  operation: () => Promise<T>,
  context?: string,
  fallback?: T
) => errorHandler.handleAsync(operation, context, fallback);