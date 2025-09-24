import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

// TODO: Install @react-native-community/netinfo for network detection
// npm install @react-native-community/netinfo

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresIn?: number; // milliseconds
}

interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

class OfflineService {
  private isOnline: boolean = true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private unsubscribe: (() => void) | null = null;

  /**
   * Initialize offline service
   */
  async initialize(): Promise<void> {
    // Network detection will be available when @react-native-community/netinfo is installed
    console.log('[OfflineService] Initialized (network detection pending NetInfo installation)');

    // For now, assume online
    this.isOnline = true;
  }

  /**
   * Check if device is online
   */
  async checkConnection(): Promise<boolean> {
    // This will work properly once NetInfo is installed
    // For now, return current status
    return this.isOnline;
  }

  /**
   * Get current online status
   */
  getStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Add network status listener
   */
  addListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Cache data with optional expiration
   */
  async cacheData<T>(key: string, data: T, expiresInMs?: number): Promise<void> {
    try {
      const cachedData: CachedData<T> = {
        data,
        timestamp: Date.now(),
        expiresIn: expiresInMs
      };

      await AsyncStorage.setItem(
        `cache_${key}`,
        JSON.stringify(cachedData)
      );

      console.log(`[OfflineService] Cached data for key: ${key}`);
    } catch (error) {
      console.error('[OfflineService] Cache error:', error);
    }
  }

  /**
   * Get cached data
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cachedString = await AsyncStorage.getItem(`cache_${key}`);

      if (!cachedString) {
        return null;
      }

      const cached: CachedData<T> = JSON.parse(cachedString);

      // Check if expired
      if (cached.expiresIn) {
        const expirationTime = cached.timestamp + cached.expiresIn;
        if (Date.now() > expirationTime) {
          console.log(`[OfflineService] Cache expired for key: ${key}`);
          await this.clearCache(key);
          return null;
        }
      }

      console.log(`[OfflineService] Retrieved cached data for key: ${key}`);
      return cached.data;
    } catch (error) {
      console.error('[OfflineService] Get cache error:', error);
      return null;
    }
  }

  /**
   * Clear specific cache
   */
  async clearCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
      console.log(`[OfflineService] Cleared cache for key: ${key}`);
    } catch (error) {
      console.error('[OfflineService] Clear cache error:', error);
    }
  }

  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`[OfflineService] Cleared ${cacheKeys.length} cache entries`);
      }
    } catch (error) {
      console.error('[OfflineService] Clear all cache error:', error);
    }
  }

  /**
   * Queue action for later execution (when online)
   */
  async queueAction(type: string, payload: any): Promise<void> {
    try {
      const action: OfflineAction = {
        id: `${type}_${Date.now()}`,
        type,
        payload,
        timestamp: Date.now(),
        retryCount: 0
      };

      const queueString = await AsyncStorage.getItem('offline_queue');
      const queue: OfflineAction[] = queueString ? JSON.parse(queueString) : [];

      queue.push(action);

      await AsyncStorage.setItem('offline_queue', JSON.stringify(queue));

      console.log(`[OfflineService] Queued action: ${type}`);
    } catch (error) {
      console.error('[OfflineService] Queue action error:', error);
    }
  }

  /**
   * Get offline queue
   */
  async getOfflineQueue(): Promise<OfflineAction[]> {
    try {
      const queueString = await AsyncStorage.getItem('offline_queue');
      return queueString ? JSON.parse(queueString) : [];
    } catch (error) {
      console.error('[OfflineService] Get queue error:', error);
      return [];
    }
  }

  /**
   * Process offline queue
   */
  async processOfflineQueue(): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();

      if (queue.length === 0) {
        return;
      }

      console.log(`[OfflineService] Processing ${queue.length} queued actions`);

      const successfulActions: string[] = [];

      for (const action of queue) {
        try {
          // Here you would dispatch the action to your state management
          // or execute the appropriate service method
          await this.executeAction(action);

          successfulActions.push(action.id);
        } catch (error) {
          console.error(`[OfflineService] Action execution failed:`, error);

          // Retry logic
          if (action.retryCount < 3) {
            action.retryCount++;
          } else {
            // Max retries reached, remove from queue
            successfulActions.push(action.id);
          }
        }
      }

      // Remove successful actions from queue
      const remainingQueue = queue.filter(
        action => !successfulActions.includes(action.id)
      );

      await AsyncStorage.setItem(
        'offline_queue',
        JSON.stringify(remainingQueue)
      );

      console.log(
        `[OfflineService] Queue processed. ${successfulActions.length} successful, ${remainingQueue.length} remaining`
      );
    } catch (error) {
      console.error('[OfflineService] Process queue error:', error);
    }
  }

  /**
   * Execute queued action
   */
  private async executeAction(action: OfflineAction): Promise<void> {
    // This is where you would implement the actual execution logic
    // based on the action type and your app's architecture
    switch (action.type) {
      case 'CREATE_PARKING_SESSION':
        // Execute parking session creation
        break;
      case 'UPDATE_USER_PROFILE':
        // Execute profile update
        break;
      case 'SUBMIT_PAYMENT':
        // Execute payment submission
        break;
      default:
        console.warn(`[OfflineService] Unknown action type: ${action.type}`);
    }
  }

  /**
   * Clear offline queue
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem('offline_queue');
      console.log('[OfflineService] Queue cleared');
    } catch (error) {
      console.error('[OfflineService] Clear queue error:', error);
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.listeners.clear();
    console.log('[OfflineService] Cleanup complete');
  }
}

// Export singleton instance
export const offlineService = new OfflineService();

/**
 * React hook for offline status
 */
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(offlineService.getStatus());

  useEffect(() => {
    const unsubscribe = offlineService.addListener(setIsOnline);
    return unsubscribe;
  }, []);

  return isOnline;
};

/**
 * React hook for cached data
 */
export const useCachedData = <T,>(key: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCachedData = async () => {
      setLoading(true);
      const cached = await offlineService.getCachedData<T>(key);
      setData(cached);
      setLoading(false);
    };

    loadCachedData();
  }, [key]);

  const updateCache = async (newData: T, expiresInMs?: number) => {
    await offlineService.cacheData(key, newData, expiresInMs);
    setData(newData);
  };

  const clearCache = async () => {
    await offlineService.clearCache(key);
    setData(null);
  };

  return { data, loading, updateCache, clearCache };
};

export default offlineService;