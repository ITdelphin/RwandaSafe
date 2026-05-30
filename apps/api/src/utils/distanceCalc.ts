const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearest<T extends { latitude?: number | null; longitude?: number | null }>(
  items: T[],
  lat: number,
  lon: number
): T | null {
  let nearest: T | null = null;
  let minDist = Infinity;
  for (const item of items) {
    if (item.latitude == null || item.longitude == null) continue;
    const d = haversineDistance(lat, lon, item.latitude, item.longitude);
    if (d < minDist) { minDist = d; nearest = item; }
  }
  return nearest;
}
