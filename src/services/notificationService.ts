import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

export interface NotificationData {
  type: 'parking' | 'payment' | 'emergency' | 'system' | 'promotion';
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      // Request permissions
      const permission = await this.requestPermissions();

      if (permission) {
        // Register for push notifications
        await this.registerForPushNotifications();

        // Set up notification listeners
        this.setupNotificationListeners();

        console.log('[NotificationService] Initialized successfully');
      }
    } catch (error) {
      console.error('[NotificationService] Initialization error:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[NotificationService] Notification permissions not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[NotificationService] Permission request error:', error);
      return false;
    }
  }

  /**
   * Register for push notifications and get token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1d4ed8'
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id' // Replace with actual project ID
      });

      this.expoPushToken = tokenData.data;

      // Save token to AsyncStorage
      await AsyncStorage.setItem('expoPushToken', this.expoPushToken);

      console.log('[NotificationService] Push token:', this.expoPushToken);

      return this.expoPushToken;
    } catch (error) {
      console.error('[NotificationService] Token registration error:', error);
      return null;
    }
  }

  /**
   * Get current push token
   */
  async getPushToken(): Promise<string | null> {
    if (this.expoPushToken) {
      return this.expoPushToken;
    }

    // Try to get from AsyncStorage
    const storedToken = await AsyncStorage.getItem('expoPushToken');
    if (storedToken) {
      this.expoPushToken = storedToken;
      return storedToken;
    }

    // Register if not found
    return await this.registerForPushNotifications();
  }

  /**
   * Set up notification listeners
   */
  private setupNotificationListeners(): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[NotificationService] Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listener for when a notification is tapped
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[NotificationService] Notification tapped:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Handle notification received
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    // Custom logic when notification is received
    const data = notification.request.content.data;

    // You can handle different notification types here
    switch (data?.type) {
      case 'parking':
        // Handle parking-related notification
        break;
      case 'payment':
        // Handle payment-related notification
        break;
      case 'emergency':
        // Handle emergency notification
        break;
      default:
        break;
    }
  }

  /**
   * Handle notification response (when user taps)
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data;

    // Navigate based on notification type
    // This would typically use navigation service
    switch (data?.type) {
      case 'parking':
        // Navigate to parking details
        break;
      case 'payment':
        // Navigate to payment history
        break;
      case 'emergency':
        // Navigate to emergency details
        break;
      default:
        break;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleNotification(
    notification: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: {
            type: notification.type,
            ...notification.data
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH
        },
        trigger: trigger || null
      });

      console.log('[NotificationService] Notification scheduled:', identifier);
      return identifier;
    } catch (error) {
      console.error('[NotificationService] Schedule error:', error);
      throw error;
    }
  }

  /**
   * Send immediate local notification
   */
  async sendLocalNotification(notification: NotificationData): Promise<string> {
    return this.scheduleNotification(notification);
  }

  /**
   * Schedule parking expiration reminder
   */
  async scheduleParkingReminder(
    expirationTime: Date,
    sessionId: string,
    minutesBefore: number = 15
  ): Promise<string> {
    const reminderTime = new Date(expirationTime.getTime() - minutesBefore * 60000);
    const now = new Date();

    if (reminderTime <= now) {
      throw new Error('Reminder time is in the past');
    }

    return this.scheduleNotification(
      {
        type: 'parking',
        title: 'Parking Session Expiring Soon',
        body: `Your parking session will expire in ${minutesBefore} minutes`,
        data: { sessionId }
      },
      {
        date: reminderTime
      }
    );
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('[NotificationService] Notification cancelled:', identifier);
    } catch (error) {
      console.error('[NotificationService] Cancel error:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[NotificationService] All notifications cancelled');
    } catch (error) {
      console.error('[NotificationService] Cancel all error:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('[NotificationService] Get scheduled error:', error);
      return [];
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('[NotificationService] Set badge error:', error);
    }
  }

  /**
   * Clear badge count
   */
  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * Dismiss all notifications
   */
  async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('[NotificationService] All notifications dismissed');
    } catch (error) {
      console.error('[NotificationService] Dismiss error:', error);
    }
  }

  /**
   * Check notification settings
   */
  async checkNotificationSettings(): Promise<{
    enabled: boolean;
    status: string;
  }> {
    try {
      const { status } = await Notifications.getPermissionsAsync();

      return {
        enabled: status === 'granted',
        status
      };
    } catch (error) {
      console.error('[NotificationService] Check settings error:', error);
      return {
        enabled: false,
        status: 'unknown'
      };
    }
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }

    console.log('[NotificationService] Cleanup complete');
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

export default notificationService;