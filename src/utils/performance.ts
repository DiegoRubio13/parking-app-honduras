import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';

/**
 * Debounce hook for performance optimization
 */
export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook for performance optimization
 */
export const useThrottle = <T,>(value: T, limit: number = 500): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

/**
 * Debounced callback
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
};

/**
 * Throttled callback
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 500
): T => {
  const inThrottle = useRef(false);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;

        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    }) as T,
    [callback, limit]
  );
};

/**
 * Memoized value that only updates when dependencies change
 */
export const useMemoizedValue = <T,>(factory: () => T, deps: React.DependencyList): T => {
  return useMemo(factory, deps);
};

/**
 * Previous value hook for comparison
 */
export const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * Mount/Unmount tracking
 */
export const useIsMounted = (): (() => boolean) => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
};

/**
 * Safe async state update (prevents setState on unmounted component)
 */
export const useSafeState = <T,>(initialState: T): [T, (value: T) => void] => {
  const [state, setState] = useState<T>(initialState);
  const isMounted = useIsMounted();

  const setSafeState = useCallback(
    (value: T) => {
      if (isMounted()) {
        setState(value);
      }
    },
    [isMounted]
  );

  return [state, setSafeState];
};

/**
 * Lazy initialization hook
 */
export const useLazyInitialization = <T,>(initializer: () => T): T => {
  const [value] = useState(initializer);
  return value;
};

/**
 * Update effect (runs only on updates, not on mount)
 */
export const useUpdateEffect = (effect: React.EffectCallback, deps?: React.DependencyList) => {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    return effect();
  }, deps);
};

/**
 * Interval hook
 */
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
};

/**
 * Timeout hook
 */
export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay]);
};

/**
 * Media query hook for responsive design
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // This would work in web environment
    // For React Native, you'd use Dimensions
    const media = window.matchMedia?.(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener?.('change', listener);

    return () => media.removeEventListener?.('change', listener);
  }, [matches, query]);

  return matches;
};

/**
 * Local storage hook with JSON parsing
 */
export const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  };

  return [storedValue, setValue, removeValue];
};

/**
 * Measure component render performance
 */
export const useRenderCount = (componentName: string = 'Component'): number => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`[Performance] ${componentName} rendered ${renderCount.current} times`);
  });

  return renderCount.current;
};

/**
 * Performance measurement utility
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static startMeasure(label: string): void {
    this.marks.set(label, Date.now());
    if (__DEV__) {
      console.log(`[Performance] Started measuring: ${label}`);
    }
  }

  static endMeasure(label: string): number {
    const start = this.marks.get(label);

    if (!start) {
      console.warn(`[Performance] No start mark found for: ${label}`);
      return 0;
    }

    const duration = Date.now() - start;
    this.marks.delete(label);

    if (__DEV__) {
      console.log(`[Performance] ${label}: ${duration}ms`);
    }

    return duration;
  }

  static measure(label: string, fn: () => void): number {
    this.startMeasure(label);
    fn();
    return this.endMeasure(label);
  }

  static async measureAsync(label: string, fn: () => Promise<void>): Promise<number> {
    this.startMeasure(label);
    await fn();
    return this.endMeasure(label);
  }
}

