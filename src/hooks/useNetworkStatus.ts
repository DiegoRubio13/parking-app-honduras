/**
 * Hook para monitorear el estado de la red
 * Soluciona: Errores de red sin manejo, operaciones sin conexión
 */

import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string | null;
}

/**
 * Hook para obtener el estado actual de la red
 * @returns Estado de conectividad
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    // Obtener estado inicial
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
      setType(state.type);
    });

    // Suscribirse a cambios
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      const reachable = state.isInternetReachable ?? false;

      console.log('Network status changed:', {
        isConnected: connected,
        isInternetReachable: reachable,
        type: state.type
      });

      setIsConnected(connected);
      setIsInternetReachable(reachable);
      setType(state.type);
    });

    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    isInternetReachable,
    type
  };
};

/**
 * Hook para ejecutar callback cuando cambia el estado de la red
 */
export const useNetworkListener = (
  onOnline: () => void,
  onOffline: () => void
) => {
  const { isConnected, isInternetReachable } = useNetworkStatus();

  useEffect(() => {
    if (isConnected && isInternetReachable) {
      onOnline();
    } else {
      onOffline();
    }
  }, [isConnected, isInternetReachable, onOnline, onOffline]);
};