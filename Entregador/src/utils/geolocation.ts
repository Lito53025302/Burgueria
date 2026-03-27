import { logger } from './logger';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

/**
 * Utilitário para lidar com geolocalização no app do entregador
 */
export const geolocation = {
  /**
   * Verifica se a geolocalização está disponível no navegador
   */
  isAvailable: (): boolean => {
    return 'geolocation' in navigator;
  },

  /**
   * Solicita a posição atual do usuário (Promise)
   */
  getCurrentPosition: (): Promise<GeolocationData> => {
    return new Promise((resolve, reject) => {
      if (!geolocation.isAvailable()) {
        reject(new Error('Geolocalização não suportada neste navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          logger.error('Erro ao obter geolocalização', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  },

  /**
   * Inicia o monitoramento da posição (Watch)
   * @param onUpdate Callback chamado a cada atualização de posição
   * @param onError Callback chamado em caso de erro
   * @returns ID do watcher para ser usado no clearWatch
   */
  watchPosition: (
    onUpdate: (data: GeolocationData) => void,
    onError?: (error: GeolocationPositionError) => void
  ): number => {
    if (!geolocation.isAvailable()) {
      throw new Error('Geolocalização não suportada');
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        onUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        logger.error('Erro no watch de geolocalização', error);
        if (onError) onError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  },

  /**
   * Para o monitoramento da posição
   * @param watchId ID retornado pelo watchPosition
   */
  clearWatch: (watchId: number): void => {
    navigator.geolocation.clearWatch(watchId);
  }
};
