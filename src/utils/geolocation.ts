/**
 * Calcula a distância entre duas coordenadas geográficas usando a fórmula de Haversine
 * @param lat1 Latitude do ponto 1
 * @param lon1 Longitude do ponto 1
 * @param lat2 Latitude do ponto 2
 * @param lon2 Longitude do ponto 2
 * @returns Distância em quilômetros
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Raio da Terra em km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Formata a distância para exibição
 * @param distanceKm Distância em quilômetros
 * @returns String formatada (ex: "800m" ou "1.2km")
 */
export function formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
        // Menos de 1km, mostrar em metros
        const meters = Math.round(distanceKm * 1000);
        return `${meters}m`;
    } else {
        // 1km ou mais, mostrar em km com 1 casa decimal
        return `${distanceKm.toFixed(1)}km`;
    }
}

/**
 * Obtém a localização atual do usuário
 * @returns Promise com as coordenadas ou null se não autorizado
 */
export function getUserLocation(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            // Geolocalização não suportada - retorna null silenciosamente
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            () => {
                // Erro ao obter localização - retorna null silenciosamente
                resolve(null);
            },
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 300000 // Cache de 5 minutos
            }
        );
    });
}
