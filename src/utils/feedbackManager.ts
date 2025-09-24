import { Alert } from 'react-native';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackMessage {
  title?: string;
  message: string;
  type: FeedbackType;
  duration?: number;
}

class FeedbackManager {
  private toastCallback: ((message: string, type: FeedbackType, duration?: number) => void) | null = null;

  /**
   * Register toast callback (used by Toast provider)
   */
  registerToast(callback: (message: string, type: FeedbackType, duration?: number) => void): void {
    this.toastCallback = callback;
  }

  /**
   * Show toast message
   */
  showToast(message: string, type: FeedbackType = 'info', duration?: number): void {
    if (this.toastCallback) {
      this.toastCallback(message, type, duration);
    } else {
      console.warn('[FeedbackManager] Toast not registered, falling back to console');
      console.log(`[Toast ${type}]`, message);
    }
  }

  /**
   * Show success toast
   */
  success(message: string, duration?: number): void {
    this.showToast(message, 'success', duration);
  }

  /**
   * Show error toast
   */
  error(message: string, duration?: number): void {
    this.showToast(message, 'error', duration);
  }

  /**
   * Show warning toast
   */
  warning(message: string, duration?: number): void {
    this.showToast(message, 'warning', duration);
  }

  /**
   * Show info toast
   */
  info(message: string, duration?: number): void {
    this.showToast(message, 'info', duration);
  }

  /**
   * Show native alert
   */
  showAlert(title: string, message: string, buttons?: any[]): void {
    Alert.alert(
      title,
      message,
      buttons || [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  }

  /**
   * Show confirmation dialog
   */
  confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ): void {
    Alert.alert(
      title,
      message,
      [
        {
          text: cancelText,
          style: 'cancel',
          onPress: onCancel
        },
        {
          text: confirmText,
          style: 'default',
          onPress: onConfirm
        }
      ],
      { cancelable: true }
    );
  }

  /**
   * Show destructive confirmation
   */
  confirmDestructive(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Delete',
    cancelText: string = 'Cancel'
  ): void {
    Alert.alert(
      title,
      message,
      [
        {
          text: cancelText,
          style: 'cancel',
          onPress: onCancel
        },
        {
          text: confirmText,
          style: 'destructive',
          onPress: onConfirm
        }
      ],
      { cancelable: true }
    );
  }

  /**
   * Show loading feedback (you would implement a loading overlay)
   */
  showLoading(message: string = 'Loading...'): void {
    console.log('[FeedbackManager] Show loading:', message);
    // Implement loading overlay here
  }

  /**
   * Hide loading feedback
   */
  hideLoading(): void {
    console.log('[FeedbackManager] Hide loading');
    // Hide loading overlay here
  }
}

// Export singleton instance
export const feedbackManager = new FeedbackManager();

// Convenience exports
export const showToast = (message: string, type: FeedbackType = 'info', duration?: number) =>
  feedbackManager.showToast(message, type, duration);

export const showSuccess = (message: string, duration?: number) =>
  feedbackManager.success(message, duration);

export const showError = (message: string, duration?: number) =>
  feedbackManager.error(message, duration);

export const showWarning = (message: string, duration?: number) =>
  feedbackManager.warning(message, duration);

export const showInfo = (message: string, duration?: number) =>
  feedbackManager.info(message, duration);

export const showAlert = (title: string, message: string, buttons?: any[]) =>
  feedbackManager.showAlert(title, message, buttons);

export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText?: string,
  cancelText?: string
) => feedbackManager.confirm(title, message, onConfirm, onCancel, confirmText, cancelText);

export const showConfirmDestructive = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText?: string,
  cancelText?: string
) => feedbackManager.confirmDestructive(title, message, onConfirm, onCancel, confirmText, cancelText);

export default feedbackManager;