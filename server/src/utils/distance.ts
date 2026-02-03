/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Find technicians within a certain radius
 * @param lat - Center latitude
 * @param lon - Center longitude
 * @param radiusKm - Search radius in kilometers
 * @param technicians - Array of technicians with coordinates
 * @returns Technicians within radius, sorted by distance
 */
export const findNearbyTechnicians = (
  lat: number,
  lon: number,
  radiusKm: number,
  technicians: Array<{ id: string; latitude?: number; longitude?: number; [key: string]: any }>
): Array<{ technician: any; distance: number }> => {
  const nearby = technicians
    .filter(tech => tech.latitude && tech.longitude)
    .map(tech => ({
      technician: tech,
      distance: calculateDistance(lat, lon, tech.latitude!, tech.longitude!)
    }))
    .filter(item => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  return nearby;
};
