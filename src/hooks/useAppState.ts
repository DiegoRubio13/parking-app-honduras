/**
 * Hook para monitorear el estado de la aplicación
 * Soluciona: Problemas con interrupciones (llamadas, app en background)
 */

import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Hook para detectar cambios entre foreground y background
 * @param onForeground - Callback cuando la app vuelve al foreground
 * @param onBackground - Callback cuando la app va al background
 * @returns Estado actual de la app
 */
export const useAppState = (
  onForeground?: () => void,
  onBackground?: () => void
): AppStateStatus => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to foreground');
        onForeground?.();
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        console.log('App has gone to background');
        onBackground?.();
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, [onForeground, onBackground]);

  return appStateVisible;
};