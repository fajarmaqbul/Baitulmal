// Utility to add sample coordinates to Asnaf data
// Center point: Monas Jakarta (-6.1754, 106.8272)
// Each RT gets a cluster of coordinates offset from center

const generateCoordinates = (rt, index, total) => {
    const baseLat = -6.1754;
    const baseLng = 106.8272;

    // RT offset (each RT in different direction)
    const rtOffset = {
        '01': { lat: 0.005, lng: 0.005 },   // NE
        '02': { lat: 0.005, lng: -0.005 },  // NW
        '03': { lat: -0.005, lng: -0.005 }, // SW
        '04': { lat: -0.005, lng: 0.005 },  // SE
        '05': { lat: 0.008, lng: 0 },       // N
        '06': { lat: 0, lng: 0.008 },       // E
        '07': { lat: -0.008, lng: 0 }       // S
    };

    const offset = rtOffset[rt] || { lat: 0, lng: 0 };

    // Scatter within RT cluster (avoid overlap)
    const scatter = (Math.random() - 0.5) * 0.003;

    return {
        latitude: baseLat + offset.lat + scatter,
        longitude: baseLng + offset.lng + scatter
    };
};

// Read and process asnafData
const fs = require('fs');
const path = require('path');

const contextPath = path.join(__dirname, '../src/context/BaitulmallContext.jsx');
let content = fs.readFileSync(contextPath, 'utf8');

// Find the asnafData array and add coordinates
// This is a simplified approach - for production, parse AST properly
console.log('Script to add coordinates - run this in Node.js environment');
console.log('For now, coordinates will be added directly in component initialization');

module.exports = { generateCoordinates };
