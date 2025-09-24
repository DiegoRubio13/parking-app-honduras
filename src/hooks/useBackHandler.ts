/**
 * Hook para manejar el botón Back de Android
 * Soluciona: Pérdida de estado al presionar back durante procesos críticos
 */

import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * Hook para manejar el hardware back button en Android
 * @param handler - Función que maneja el evento. Retorna true para prevenir el comportamiento por defecto
 * @param dependencies - Array de dependencias para el useEffect
 */
export const useBackHandler = (
  handler: () => boolean,
  dependencies: any[] = []
) => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handler
    );

    return () => backHandler.remove();
  }, dependencies);
};