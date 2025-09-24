// Error handling
export { errorHandler, handleError, handleAsync, ErrorType } from './errorHandler';
export type { AppError } from './errorHandler';

// Validation
export { default as Validator, validationRules } from './validation';
export type { ValidationRule, ValidationResult } from './validation';

// Feedback management
export {
  feedbackManager,
  showToast,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showAlert,
  showConfirm,
  showConfirmDestructive
} from './feedbackManager';
export type { FeedbackType } from './feedbackManager';

// Performance optimization
export {
  useDebounce,
  useThrottle,
  useDebouncedCallback,
  useThrottledCallback,
  useMemoizedValue,
  usePrevious,
  useIsMounted,
  useSafeState,
  useLazyInitialization,
  useUpdateEffect,
  useInterval,
  useTimeout,
  useMediaQuery,
  useLocalStorage,
  useRenderCount,
  PerformanceMonitor
} from './performance';