const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return parseFloat((R * c).toFixed(1)); // Return 1 decimal place
};

/**
 * Simple heuristic for area label if no external API is available server-side.
 * In a real app, use Google Maps / Mapbox / OpenStreetMap API here.
 */
const areaLabelFromCoords = (lat, lng) => {
    if (!lat || !lng) return "Unknown Area";
    // Placeholder: In production, integrate Node-Geocoder or similar.
    // For now, return coordinates formatted or generic.
    // The Frontend handles the real Reverse Geocoding via Nominatim.
    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
};

module.exports = { haversineDistance, areaLabelFromCoords };
