// Location utilities
// We store lat/lng as integers (value * 1e6) for precision without float issues
// Example: 19.076090 -> 19076090

const EARTH_RADIUS_KM = 6371;

export function toStoredCoord(value: number): number {
  return Math.round(value * 1e6);
}

export function fromStoredCoord(value: number): number {
  return value / 1e6;
}

// Haversine distance calculation between two points
export function distanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  // Convert from stored format
  const la1 = fromStoredCoord(lat1);
  const lo1 = fromStoredCoord(lng1);
  const la2 = fromStoredCoord(lat2);
  const lo2 = fromStoredCoord(lng2);

  const dLat = toRad(la2 - la1);
  const dLng = toRad(lo2 - lo1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(la1)) * Math.cos(toRad(la2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Rough bounding box filter for SQL WHERE clause (pre-filter before exact distance calc)
// Returns min/max lat/lng in stored format for a given center + radius
export function boundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = (radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos(fromStoredCoord(lat) * Math.PI / 180);

  return {
    minLat: lat - toStoredCoord(latDelta),
    maxLat: lat + toStoredCoord(latDelta),
    minLng: lng - toStoredCoord(lngDelta),
    maxLng: lng + toStoredCoord(lngDelta),
  };
}
