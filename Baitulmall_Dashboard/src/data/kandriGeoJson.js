/**
 * Simplified GeoJSON for Desa Kandri, Gunungpati, Semarang
 * Base coordinate: -7.042083, 110.351722
 * 
 * This is a SIMPLIFIED representation for visualization purposes.
 * Each RT is represented as a polygon around the village center.
 */

// Base coordinates
const BASE_LAT = -7.042083;
const BASE_LNG = 110.351722;

// Helper to create polygon coordinates around a center point
const createPolygon = (centerLat, centerLng, size = 0.003) => {
    return [
        [centerLng - size, centerLat - size],
        [centerLng + size, centerLat - size],
        [centerLng + size, centerLat + size],
        [centerLng - size, centerLat + size],
        [centerLng - size, centerLat - size] // Close the polygon
    ];
};

// RT offset definitions (same as PetaAsnaf.jsx)
const rtDefinitions = {
    '01': { lat: BASE_LAT + 0.008, lng: BASE_LNG + 0.005, name: 'RT 01' },
    '02': { lat: BASE_LAT + 0.008, lng: BASE_LNG - 0.005, name: 'RT 02' },
    '03': { lat: BASE_LAT, lng: BASE_LNG - 0.010, name: 'RT 03' },
    '04': { lat: BASE_LAT - 0.008, lng: BASE_LNG - 0.005, name: 'RT 04' },
    '05': { lat: BASE_LAT - 0.008, lng: BASE_LNG + 0.005, name: 'RT 05' },
    '06': { lat: BASE_LAT, lng: BASE_LNG + 0.010, name: 'RT 06' },
    '07': { lat: BASE_LAT, lng: BASE_LNG, name: 'RT 07 (Pusat)' }
};

// Generate GeoJSON FeatureCollection
export const kandriGeoJson = {
    type: 'FeatureCollection',
    features: Object.entries(rtDefinitions).map(([rtCode, rtData]) => ({
        type: 'Feature',
        id: rtCode,
        properties: {
            'hc-key': rtCode,
            name: rtData.name,
            rt: rtCode
        },
        geometry: {
            type: 'Polygon',
            coordinates: [createPolygon(rtData.lat, rtData.lng, 0.004)]
        }
    }))
};

// For Highcharts Maps, we need to convert to a specific format
// This is a simpler Tile Grid Map approach as true geo-boundaries are complex
export const kandriTileGrid = [
    { 'hc-key': '01', name: 'RT 01', x: 1, y: 0 },
    { 'hc-key': '02', name: 'RT 02', x: 2, y: 0 },
    { 'hc-key': '03', name: 'RT 03', x: 0, y: 1 },
    { 'hc-key': '04', name: 'RT 04', x: 1, y: 1 },
    { 'hc-key': '05', name: 'RT 05', x: 2, y: 1 },
    { 'hc-key': '06', name: 'RT 06', x: 0, y: 2 },
    { 'hc-key': '07', name: 'RT 07', x: 1, y: 2 }
];

export default kandriGeoJson;
