// NASA SEDAC API Configuration (VERIFIED WORKING)
const NASA_GHG_CONFIG = {
    rasterApi: 'https://earth.gov/ghgcenter/api/raster',
    collection: 'sedac-popdensity-yeargrid5yr-v4.11',
    item: 'sedac-popdensity-yeargrid5yr-v4.11-gpw_v4_population_density_rev11_2020_30_sec_2020',
    asset: 'population-density',  // CRITICAL: With hyphen, not underscore
    timeout: 15000,
    maxRetries: 3
};

// Target Material Density Configuration
const TARGET_DENSITY_CONFIG = {
    ocean: 1025, // in kg/m³
    defaultLand: 2700, // in kg/m³
    presets: {
        sediment: 1500,
        rock: 2700,
        hardRock: 3200,
        granite: 2750,
        basalt: 2900
    }
};

// Water Depth Configuration
const WATER_DEPTH_CONFIG = { // in m
    default: 4000, // Default ocean depth in meters
    min: 100,      // Minimum depth (shallow water)
    max: 6000,     // Maximum depth (deep ocean)
    presets: {
        shallow: 500,
        continental_shelf: 200,
        average: 4000,
        deep: 6000,
        abyssal: 5500
    }
};

class PopulationDataCache {
    constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
    }

    getCacheKey(lat, lon) {
        return `${Math.round(lat * 1000) / 1000},${Math.round(lon * 1000) / 1000}`;
    }

    async getPopulationDensity(lat, lon) {
        const cacheKey = this.getCacheKey(lat, lon);
        
        // Return cached result if available
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Return pending request if already in progress
        if (this.pendingRequests.has(cacheKey)) {
            return await this.pendingRequests.get(cacheKey);
        }

        // Create new request
        const requestPromise = this.fetchPopulationData(lat, lon);
        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            const result = await requestPromise;
            this.cache.set(cacheKey, result);
            return result;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    async fetchPopulationData(lat, lon) {
        // Try NASA SEDAC API first
        const nasaResult = await this.fetchFromNASA(lat, lon);
        if (nasaResult) {
            return nasaResult;
        }

        // Fall back to regional analysis
        return this.getRegionalEstimate(lat, lon);
    }

    async fetchFromNASA(lat, lon) {
        const url = `${NASA_GHG_CONFIG.rasterApi}/collections/${NASA_GHG_CONFIG.collection}/items/${NASA_GHG_CONFIG.item}/point/${lon},${lat}?assets=${NASA_GHG_CONFIG.asset}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(NASA_GHG_CONFIG.timeout)
            });
            
            if (response.ok) {
                const data = await response.json();
                return this.processNASAResponse(data, lat, lon);
            } else {
                console.warn(`NASA SEDAC API HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.warn('NASA SEDAC API error:', error.message);
        }
        
        return null; // Will trigger fallback
    }

    processNASAResponse(data, lat, lon) {
        if (data.values && data.values.length > 0) {
            let density = data.values[0];
            
            // Handle special NASA values
            if (density === -9999) {
                // This is NoData (usually ocean)
                return {
                    density: 0,
                    source: 'NASA SEDAC API',
                    note: 'Ocean/No Population Data',
                    quality: 'High (1km resolution)',
                    isOceanData: true // Flag for ocean detection
                };
            } else if (density < 0) {
                // Other negative values are also NoData
                return {
                    density: 0,
                    source: 'NASA SEDAC API', 
                    note: 'No Data Available',
                    quality: 'High (1km resolution)',
                    isOceanData: true // Flag for ocean detection
                };
            } else {
                // Valid population density - likely land
                return {
                    density: Math.round(density * 100) / 100,
                    source: 'NASA SEDAC API',
                    quality: 'High (1km resolution)',
                    coordinates: data.coordinates,
                    isOceanData: false // Flag for land detection
                };
            }
        }
        
        return null;
    }

    getRegionalEstimate(lat, lon) {
        // Regional population density estimates based on geographic regions
        const density = this.estimateRegionalDensity(lat, lon);
        
        return {
            density: density,
            source: 'Regional Analysis',
            quality: 'Good (regional data)',
            note: 'Estimated based on regional patterns',
            isOceanData: false // Regional estimates are for land areas
        };
    }

    estimateRegionalDensity(lat, lon) {     // !!! REVISIT
        // Major populated regions with rough density estimates
        const regions = [
            // South Asia
            { bounds: [6, 68, 37, 97], density: 400 },
            // East Asia
            { bounds: [18, 100, 54, 145], density: 300 },
            // Europe
            { bounds: [35, -10, 71, 40], density: 150 },
            // Eastern US
            { bounds: [25, -100, 50, -65], density: 100 },
            // West Africa
            { bounds: [4, -20, 20, 20], density: 80 },
            // Southeast Asia
            { bounds: [-10, 95, 25, 140], density: 200 }
        ];

        for (const region of regions) {
            if (lat >= region.bounds[0] && lat <= region.bounds[2] &&
                lon >= region.bounds[1] && lon <= region.bounds[3]) {
                
                // Add some variation based on coordinates
                const variation = Math.sin(lat * 0.1) * Math.cos(lon * 0.1) * 50;
                return Math.max(0, region.density + variation);
            }
        }

        // Default low density for other areas
        return Math.max(0, 10 + Math.random() * 20);
    }
}

// Impact Zone Visualizer Class
class ImpactZoneVisualizer {
    constructor(map) {
        this.map = map;
        this.zoneCircles = [];
        this.zoneLegend = null;
        this.impactResults = null;
        this.isOceanImpact = false;
    }
    
    visualizeAllZones(impactLocation, results, isOcean) {
        this.clearAllZones();
        this.impactResults = results;
        this.isOceanImpact = isOcean;
        
        const lat = impactLocation.lat;
        const lon = impactLocation.lon;
        
        // Define all impact zones with scientific accuracy
        const zones = this.defineImpactZones(results, isOcean);
        
        // Create concentric circles (largest first for proper layering)
        this.createZoneCircles(lat, lon, zones);
        
        // Create interactive legend
        this.createZoneLegend(zones);
    }
    
    defineImpactZones(results, isOcean) {
        const zones = [
            // Thermal Range
            {
                name: 'Thermal Range',
                radius: results.physics.thermalRange * 1000, // km to m
                color: '#FDE047', // Yellow
                weight: 3,
                opacity: 0.9,
                fillOpacity: 0.25,
                description: 'Severe burns and widespread fires from thermal radiation',
                icon: 'fas fa-fire'
            },

            // Air Blast Zone
            {
                name: 'Air Blast Zone',
                radius: results.physics.airblastRange * 1000, // km to m
                color: '#F87171', // Light Red
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0.2,
                description: 'Severe structural damage from overpressure wave',
                icon: 'fas fa-wind'
            },

            // Ejecta Deposition Zone
            {
                name: 'Ejecta Deposition',
                radius: results.physics.ejectaRange * 1000, // km to m
                color: '#A16207', // Brown
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0.15,
                description: 'Hot debris fallout zone causing fires and damage',
                icon: 'fas fa-meteor'
            },
            
            // Fireball Zone
            {
                name: 'Fireball Zone',
                radius: results.physics.fireballRadius * 1000, // km to m
                color: '#FB923C', // Orange
                weight: 3,
                opacity: 0.9,
                fillOpacity: 0.3,
                description: 'Extreme thermal fireball with vaporization effects',
                icon: 'fas fa-fire-flame-curved'
            },
            
            // Crater Zone
            {
                name: 'Crater Zone',
                radius: (results.physics.finalDiameter / 2) * 1000, // km to m
                color: '#DC2626', // Red
                weight: 3,
                opacity: 1.0,
                fillOpacity: 0.4,
                description: `Impact crater: ${(results.physics.finalDiameter).toFixed(2)} km diameter, complete destruction`,
                icon: 'fas fa-circle'
            }
        ];
        
        // Add tsunami zone for ocean impacts
        if (isOcean && results.physics.tsunami) {
            zones.push({
                name: 'Tsunami Zone',
                radius: results.physics.tsunami.tsunamiRange * 1000, // km to m
                color: '#0EA5E9', // Blue
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0.2,
                description: `Tsunami waves up to ${results.physics.tsunami.rimWaveMaxAmplitude.toFixed(1)}m height`,
                icon: 'fas fa-water',
                dashArray: '10,5' // Dashed line for tsunami
            });
        }
        
        return zones.filter(zone => zone.radius > 0);
    }
    
    createZoneCircles(lat, lon, zones) {
        zones.forEach(zone => {
            const circle = L.circle([lat, lon], {
                radius: zone.radius,
                color: zone.color,
                weight: zone.weight,
                opacity: zone.opacity,
                fillOpacity: zone.fillOpacity,
                dashArray: zone.dashArray || null
            });
            
            // Add detailed popup
            circle.bindPopup(`
                <div class="zone-popup">
                    <div class="popup-header">
                        <i class="${zone.icon}"></i>
                        <h4>${zone.name}</h4>
                    </div>
                    <div class="popup-content">
                        <p><strong>Radius:</strong> ${(zone.radius).toFixed(1)} km</p>
                        <p><strong>Effect:</strong> ${zone.description}</p>
                        <div class="zone-color-indicator" style="background-color: ${zone.color};"></div>
                    </div>
                </div>
            `);
            
            circle.addTo(this.map);
            this.zoneCircles.push({circle, zone});
        });
    }
    
    createZoneLegend(zones) {
        if (this.zoneLegend) {
            this.map.removeControl(this.zoneLegend);
        }
        
        const legend = L.control({ position: 'bottomright' });
        
        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'impact-zones-legend');
            div.innerHTML = `
                <div class="legend-header">
                    <i class="fas fa-layer-group"></i>
                    <span>Impact Effect Zones Radii</span>
                    <button class="legend-toggle" onclick="this.parentElement.parentElement.classList.toggle('collapsed')">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="legend-content">
                    ${zones.map(zone => `
                        <div class="legend-item" data-zone="${zone.name}">
                            <div class="legend-icon">
                                <i class="${zone.icon}" style="color: ${zone.color};"></i>
                            </div>
                            <div class="legend-info">
                                <span class="legend-label">${zone.name}</span>
                                <span class="legend-radius">${(zone.radius).toFixed(1)} m</span>
                            </div>
                            <div class="legend-color" style="background-color: ${zone.color}; opacity: ${zone.fillOpacity};"></div>
                        </div>
                    `).join('')}
                    <div class="legend-footer">
                        <small>Click zones on map for details</small>
                    </div>
                </div>
            `;
            return div;
        };
        
        legend.addTo(this.map);
        this.zoneLegend = legend;
    }
    
    clearAllZones() {
        this.zoneCircles.forEach(({circle}) => {
            this.map.removeLayer(circle);
        });
        this.zoneCircles = [];
        
        if (this.zoneLegend) {
            this.map.removeControl(this.zoneLegend);
            this.zoneLegend = null;
        }
    }
}

class AsteroidImpactSimulator {
    constructor() {
        this.populationCache = new PopulationDataCache();
        this.currentLat = 26.1923; // IIT Guwahati Coordinates
        this.currentLon = 91.6951;
        this.map = null;
        this.marker = null;
        this.currentPopulationData = null;
        this.zoneVisualizer = null;
        this.isOceanImpact = false;
        this.currentWaterDepth = WATER_DEPTH_CONFIG.default;

        // Physical constants
        this.constants = {
            g: 9.81, // gravity (m/s²)
            earthRadius: 6371, // Earth radius in km
            waterDensity: 1000, // kg/m³
            seawaterBulkModulus: 2300000000, // Pa
            soundSpeedWater: 1530 // m/s
        };
        
        this.initializeMap();
        this.initializeEventListeners();
        this.updateSliderValues();
        this.loadInitialPopulationData();
    }

    initializeMap() {
        this.map = L.map('map').setView([this.currentLat, this.currentLon], 6);
        
        // Initialize zone visualizer
        this.zoneVisualizer = new ImpactZoneVisualizer(this.map);
        
        // FIXED: Use more reliable tile sources
        const tileLayerOptions = {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            crossOrigin: true
        };

        // Primary tile layer - using HTTPS OpenStreetMap
        try {
            const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', tileLayerOptions);
            tileLayer.addTo(this.map);
            
            // Add error handling for tile loading
            tileLayer.on('tileerror', (e) => {
                console.warn('Tile loading error, trying fallback:', e);
                // Try fallback tile source
                const fallbackTileLayer = L.tileLayer('https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png', tileLayerOptions);
                fallbackTileLayer.addTo(this.map);
            });
        } catch (error) {
            console.warn('Error loading map tiles:', error);
            // Fallback tile source
            const fallbackTileLayer = L.tileLayer('https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png', tileLayerOptions);
            fallbackTileLayer.addTo(this.map);
        }

        // Create marker
        this.marker = L.marker([this.currentLat, this.currentLon], {
            draggable: true
        }).addTo(this.map);

        // Add impact circle for visual feedback
        this.impactCircle = L.circle([this.currentLat, this.currentLon], {
            color: '#dc2626',
            fillColor: '#dc2626',
            fillOpacity: 0.1,
            radius: 1 // 1km radius
        }).addTo(this.map);

        this.marker.on('dragend', (e) => {
            const position = e.target.getLatLng();
            this.currentLat = position.lat;
            this.currentLon = position.lng;
            this.impactCircle.setLatLng([this.currentLat, this.currentLon]);
            this.updateLocationDisplay();
            this.loadPopulationData();
        });

        this.map.on('click', (e) => {
            this.currentLat = e.latlng.lat;
            this.currentLon = e.latlng.lng;
            this.marker.setLatLng([this.currentLat, this.currentLon]);
            this.impactCircle.setLatLng([this.currentLat, this.currentLon]);
            this.updateLocationDisplay();
            this.loadPopulationData();

            // Note: this.isOceanImpact gets updated in loadPopulationData()
            setTimeout(() => {
                this.updateTargetDensityVisibility(this.isOceanImpact);
            }, 100); // Small delay to ensure isOceanImpact is updated first
        });

        // Add map loaded event
        this.map.whenReady(() => {
            console.log('Map initialized successfully');
        });
    }

    initializeEventListeners() {
        // Slider event listeners
        const sliders = ['diameter', 'velocity', 'angle', 'density'];
        const targetDensitySlider = document.getElementById('target-density-slider');
        const waterDepthSlider = document.getElementById('water-depth-slider');
        if (targetDensitySlider) {
            targetDensitySlider.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('target-density-value').textContent = value;

                // Clear active preset buttons when manually sliding
                document.querySelectorAll('.preset-btn').forEach(btn => {
                    btn.classList.remove('active');
                });

                // Store current target density
                this.currentTargetDensity = parseFloat(value);

                console.log(`Target density manually set to: ${value} kg/m³`);
            });
        }
        if (waterDepthSlider) {
            waterDepthSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                document.getElementById('water-depth-value').textContent = value;

                // Clear active preset buttons when manually sliding
                document.querySelectorAll('#water-depth-group .preset-btn').forEach(btn => {
                    btn.classList.remove('active');
                });

                // Store current water depth
                this.currentWaterDepth = value;

                console.log(`Water depth manually set to: ${value}m`);
            });
        }
        sliders.forEach(slider => {
            const element = document.getElementById(`${slider}-slider`);
            element.addEventListener('input', () => this.updateSliderValues());
        });



        // Button event listeners
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculateImpactEffects();
        });

        document.getElementById('test-nasa-api').addEventListener('click', () => {
            this.testNASAAPI();
        });

        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    updateSliderValues() {
        const diameter = document.getElementById('diameter-slider').value;
        const velocity = document.getElementById('velocity-slider').value;
        const angle = document.getElementById('angle-slider').value;
        const density = document.getElementById('density-slider').value;

        document.getElementById('diameter-value').textContent = diameter;
        document.getElementById('velocity-value').textContent = velocity;
        document.getElementById('angle-value').textContent = angle;
        document.getElementById('density-value').textContent = density;

        // Update impact circle radius based on diameter
        if (this.impactCircle) {
            const radius = Math.max(500, parseInt(diameter) * 2); // Minimum 500m radius
            this.impactCircle.setRadius(radius);
        }
    }

    // FIXED: Simplified and more reliable land/ocean detection
    determineImpactType(lat, lon, populationData) {
        console.log('Determining impact type for:', lat, lon, populationData);
        
        // Primary method: Check if coordinates are in known ocean regions
        const inOceanRegion = this.isInKnownOceanRegion(lat, lon);
        console.log('In ocean region:', inOceanRegion);
        
        // Secondary method: Use NASA data if available
        if (populationData && populationData.hasOwnProperty('isOceanData')) {
            console.log('NASA data indicates ocean:', populationData.isOceanData);
            return populationData.isOceanData;
        }
        
        // Tertiary method: Very low population density in combination with location
        if (populationData && populationData.density === 0 && populationData.source === 'NASA SEDAC API') {
            return true; // Likely ocean
        }
        
        // Default: Use geographic analysis
        return inOceanRegion;
    }

    // FIXED: More accurate ocean region detection
    isInKnownOceanRegion(lat, lon) {
        // Major ocean regions with more precise boundaries
        
        // Pacific Ocean (simplified but more accurate)
        if ((lat >= -60 && lat <= 60) && 
            ((lon >= 120 && lon <= 180) || (lon >= -180 && lon <= -100))) {
            return true;
        }
        
        // Atlantic Ocean (simplified)  
        if ((lat >= -60 && lat <= 70) && (lon >= -70 && lon <= 20)) {
            // Exclude North American eastern seaboard
            if (lat >= 30 && lat <= 50 && lon >= -90 && lon <= -60) return false;
            // Exclude European/African western coasts
            if (lat >= 35 && lat <= 65 && lon >= -15 && lon <= 15) return false;
            return true;
        }
        
        // Indian Ocean
        if ((lat >= -60 && lat <= 25) && (lon >= 20 && lon <= 120)) {
            // Exclude African eastern coast
            if (lat >= -35 && lat <= 15 && lon >= 20 && lon <= 50) return false;
            // Exclude Indian subcontinent  
            if (lat >= 5 && lat <= 35 && lon >= 68 && lon <= 95) return false;
            return true;
        }
        
        // Arctic Ocean
        if (lat >= 70) return true;
        
        // Southern Ocean
        if (lat <= -50) return true;
        
        return false;
    }

    updateLocationDisplay() {
        const latDisplay = this.currentLat >= 0 ? 
            `${this.currentLat.toFixed(4)}°N` : 
            `${Math.abs(this.currentLat).toFixed(4)}°S`;
        
        const lonDisplay = this.currentLon >= 0 ? 
            `${this.currentLon.toFixed(4)}°E` : 
            `${Math.abs(this.currentLon).toFixed(4)}°W`;

        document.getElementById('lat-display').textContent = latDisplay;
        document.getElementById('lon-display').textContent = lonDisplay;
    }

    async loadInitialPopulationData() {
        this.updateLocationDisplay();
        await this.loadPopulationData();
    }

    async loadPopulationData() {
        const populationPreview = document.getElementById('population-preview');
        populationPreview.textContent = 'Loading...';

        try {
            const populationData = await this.populationCache.getPopulationDensity(
                this.currentLat, this.currentLon
            );
            
            this.currentPopulationData = populationData;
            
            // FIXED: Determine impact type and update display
            this.isOceanImpact = this.determineImpactType(this.currentLat, this.currentLon, populationData);
            console.log('Final impact type determination:', this.isOceanImpact ? 'Ocean' : 'Land');
            this.updateImpactTypeDisplay();
            
            this.updateDataSourceDisplay(populationData);
            this.updateTargetDensityVisibility(this.isOceanImpact);
            this.updateWaterDepthVisibility(this.isOceanImpact);
        } catch (error) {
            console.error('Error loading population data:', error);
            populationPreview.textContent = 'Error loading data';
        }
    }

    // Update impact type display
    updateImpactTypeDisplay() {
        const impactTypeDisplay = document.getElementById('impact-type-display');
        
        if (this.isOceanImpact) {
            impactTypeDisplay.textContent = 'Ocean Impact';
            impactTypeDisplay.className = 'impact-type-ocean';
        } else {
            impactTypeDisplay.textContent = 'Land Impact';
            impactTypeDisplay.className = 'impact-type-land';
        }
    }

    // Add this as a new method in the AsteroidImpactSimulator class
    updateWaterDepthVisibility(isOceanImpact) {
        const waterDepthGroup = document.getElementById('water-depth-group');
        const waterDepthSlider = document.getElementById('water-depth-slider');
        const waterDepthValue = document.getElementById('water-depth-value');

        if (isOceanImpact) {
            // Show water depth input for ocean impacts
            waterDepthGroup.style.display = 'block';

            // Use current slider value or default
            this.currentWaterDepth = parseFloat(waterDepthSlider?.value) || WATER_DEPTH_CONFIG.default;

            // Update display
            if (waterDepthValue) {
                waterDepthValue.textContent = this.currentWaterDepth;
            }

            // Set default preset as active
            this.setActiveDepthPreset(this.currentWaterDepth);

            console.log(`🌊 Ocean impact - Water depth available: ${this.currentWaterDepth}m`);
        } else {
            // Hide water depth input for land impacts
            waterDepthGroup.style.display = 'none';
            this.currentWaterDepth = null;

            console.log(`🏔️ Land impact - Water depth not applicable`);
        }
    }

    // Helper method to set active depth preset
    setActiveDepthPreset(depth) {
        // Clear all active presets
        document.querySelectorAll('#water-depth-group .preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Find matching preset and set as active
        const presetButtons = document.querySelectorAll('#water-depth-group .preset-btn');
        presetButtons.forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            if (onclick && onclick.includes(depth.toString())) {
                btn.classList.add('active');
            }
        });
    }

    // Add this as a new method in the AsteroidImpactSimulator class
    updateTargetDensityVisibility(isOceanImpact) {
        const targetDensityGroup = document.getElementById('target-density-group');
        const targetDensitySlider = document.getElementById('target-density-slider');
        const targetDensityValue = document.getElementById('target-density-value');

        if (isOceanImpact) {
            // Hide target density input for ocean impacts
            targetDensityGroup.style.display = 'none';

            // Set ocean density automatically
            this.currentTargetDensity = TARGET_DENSITY_CONFIG.ocean;

            console.log(`🌊 Ocean impact detected - Using seawater density: ${TARGET_DENSITY_CONFIG.ocean} kg/m³`);
        } else {
            // Show target density input for land impacts
            targetDensityGroup.style.display = 'block';

            // Use current slider value or default
            this.currentTargetDensity = parseFloat(targetDensitySlider?.value) || TARGET_DENSITY_CONFIG.defaultLand;

            console.log(`🏔️ Land impact detected - Using target density: ${this.currentTargetDensity} kg/m³`);
        }

        // Update display
        if (!isOceanImpact && targetDensityValue) {
            targetDensityValue.textContent = this.currentTargetDensity;
        }
    }


    updateDataSourceDisplay(populationData) {
        const sourceIcon = document.getElementById('data-source-icon');
        const sourceValue = document.getElementById('data-source-value');
        const populationPreview = document.getElementById('population-preview');
        
        if (populationData.source === 'NASA SEDAC API') {
            sourceIcon.className = 'fas fa-satellite success';
            sourceValue.textContent = 'NASA SEDAC (Live)';
            sourceValue.className = 'status-value success';
            
            if (populationData.note) {
                sourceValue.textContent += ` - ${populationData.note}`;
            }
        } else if (populationData.source === 'Regional Analysis') {
            sourceIcon.className = 'fas fa-map-marked-alt warning';
            sourceValue.textContent = 'Regional Analysis';
            sourceValue.className = 'status-value warning';
        } else {
            sourceIcon.className = 'fas fa-exclamation-triangle error';
            sourceValue.textContent = 'Basic Estimation';
            sourceValue.className = 'status-value error';
        }
        
        // Show population preview
        if (populationPreview) {
            populationPreview.textContent = `${populationData.density.toLocaleString()} people/km²`;
        }

        // Update NASA Data tab information
        this.updateNASADataTab(populationData);
    }

    updateNASADataTab(populationData) {
        const dataSourceDetail = document.getElementById('data-source-detail');
        const accuracyDetail = document.getElementById('accuracy-detail');
        
        if (dataSourceDetail) {
            dataSourceDetail.textContent = populationData.source;
        }
        
        if (accuracyDetail) {
            accuracyDetail.textContent = populationData.quality || '1km grid';
        }
    }

    async testNASAAPI() {
        const testButton = document.getElementById('test-nasa-api');
        const originalText = testButton.textContent;
        testButton.textContent = 'Testing...';
        testButton.disabled = true;
        
        const testPoints = [
            {name: 'Mumbai', lat: 19.076, lon: 72.8777, expected: [20000, 35000]},
            {name: 'Central India', lat: 21.1458, lon: 79.0882, expected: [5000, 15000]},
            {name: 'Rural Area', lat: 47.0, lon: -110.0, expected: [0, 10]}
        ];
        
        let results = [];
        
        for (const point of testPoints) {
            const result = await this.populationCache.fetchFromNASA(point.lat, point.lon);
            results.push({
                name: point.name,
                success: result !== null,
                density: result ? result.density : 'Failed',
                realistic: result && result.density >= point.expected[0] && result.density <= point.expected[1]
            });
        }
        
        const successCount = results.filter(r => r.success).length;
        
        testButton.textContent = successCount === 3 ? '✅ API Working' : `⚠️ ${successCount}/3 Working`;
        testButton.disabled = false;
        
        console.log('NASA API Test Results:', results);
        
        // Reset button after 3 seconds
        setTimeout(() => {
            testButton.textContent = originalText;
        }, 3000);
    }

    async calculateImpactEffects() {
        const calculateBtn = document.getElementById('calculate-btn');
        calculateBtn.textContent = 'Calculating...';
        calculateBtn.disabled = true;

        try {
            // Get current parameters
            const diameter = parseFloat(document.getElementById('diameter-slider').value); // in m
            const velocity = parseFloat(document.getElementById('velocity-slider').value); // in km/s
            const angle = parseFloat(document.getElementById('angle-slider').value);
            const density = parseFloat(document.getElementById('density-slider').value); // in kg m^-3

            // Get population data
            const populationData = this.currentPopulationData || await this.populationCache.getPopulationDensity(
                this.currentLat, this.currentLon
            );

            // Calculate impact effects
            const impactResults = this.calculateImpact(diameter, velocity, angle, density, populationData);
            
            // FIXED: Update tsunami tab visibility FIRST
            this.updateTsunamiTabVisibility();
            
            // Update display
            this.updateResultsDisplay(impactResults);
            
            // Update map visualization with all zones
            this.updateMapVisualization(impactResults);
            
            // Show results section and hide placeholder
            document.querySelector('.results-placeholder').style.display = 'none';
            document.getElementById('results-section').classList.remove('hidden');

        } catch (error) {
            console.error('Calculation error:', error);
        } finally {
            calculateBtn.textContent = 'Calculate Effects';
            calculateBtn.disabled = false;
        }
    }

    // FIXED: Update tsunami tab visibility based on ocean impact
    updateTsunamiTabVisibility() {
        const tsunamiTabButton = document.getElementById('tsunami-tab-button');
        const resultsTabsContainer = document.getElementById('results-tabs');
        
        console.log('Updating tsunami tab visibility. Is ocean impact:', this.isOceanImpact);
        
        if (this.isOceanImpact) {
            // Show tsunami tab for ocean impacts
            tsunamiTabButton.classList.remove('hidden');
            tsunamiTabButton.style.display = 'flex'; // Ensure it's visible
            resultsTabsContainer.classList.add('has-tsunami');
            console.log('Tsunami tab should now be visible');
        } else {
            // Hide tsunami tab for land impacts
            tsunamiTabButton.classList.add('hidden');
            tsunamiTabButton.style.display = 'none';
            resultsTabsContainer.classList.remove('has-tsunami');
            
            // Switch to different tab if tsunami was active
            if (tsunamiTabButton.classList.contains('active')) {
                this.switchTab('physical');
            }
            console.log('Tsunami tab should now be hidden');
        }
    }

    updateMapVisualization(results) {
        // Clear existing zones first
        this.zoneVisualizer.clearAllZones();
        
        // Visualize all impact zones
        this.zoneVisualizer.visualizeAllZones(
            { lat: this.currentLat, lon: this.currentLon },
            results,
            this.isOceanImpact
        );
        
        // Update the simple impact circle
        if (this.impactCircle) {
            const blastRadius = results.physics.airblastRange * 1000; // Convert km to meters
            this.impactCircle.setRadius(blastRadius);
            this.impactCircle.setStyle({
                color: results.riskClass === 'risk-high' ? '#dc2626' : 
                       results.riskClass === 'risk-moderate' ? '#ea580c' : '#16a34a',
                fillOpacity: 0.15
            });
        }
    }

    calculateImpact(diameter, velocity, angle, density, populationData) {
        const L = diameter; // in m
        const vi = velocity * 1000; // in m/s
        const g = this.constants.g; // in m s^-2
        const rho_i = density; // in kg m^-3
        const radius = L / 2; // in m
        const theta = angle;
        const mass = (4/3) * Math.PI * Math.pow(radius, 3) * density; // kg
        const kineticEnergy = 0.5 * mass * Math.pow(vi, 2); // Joules
        const energyMegatons = kineticEnergy / (4.184e15); // Convert to megatons TNT
        const energyKilotons = energyMegatons * 1000; // convert to kilotons TNT
        let finalDiameter;
        let craterDepth;

        // GET TARGET DENSITY BASED ON IMPACT TYPE
        let targetDensity;
        if (this.isOceanImpact) {
            // Ocean impact: use seawater density
            targetDensity = TARGET_DENSITY_CONFIG.ocean; // 1025 kg/m³
        } else {
            // Land impact: use slider value or default
            const targetSlider = document.getElementById('target-density-slider');
            targetDensity = targetSlider ? parseFloat(targetSlider.value) : TARGET_DENSITY_CONFIG.defaultLand;
        }
        console.log(`Using target density: ${targetDensity} kg/m³ for ${this.isOceanImpact ? 'ocean' : 'land'} impact`);
        const rho_t = targetDensity; // in kg m^-3

        // Crater calculations
        const transientDiameter = 1.161 * Math.pow(rho_i / rho_t, 1/3) *
            Math.pow(L, 0.78) * Math.pow(vi, 0.44) * Math.pow(Math.sin(theta * Math.PI / 180), 1/3) / Math.pow(g, 0.22) / 1000; // in km
        if (transientDiameter < 3.200) {
            finalDiameter = transientDiameter * 1.25; // in km
            craterDepth = transientDiameter / (2 * Math.pow(2, 0.5)) - 2.8 * 0.032 * finalDiameter * 1.03584 + 0.03584 * transientDiameter; // in km
        } else {
            finalDiameter = 1.17 * Math.pow(transientDiameter, 1.13) / Math.pow(3200, 0.13); // in km
            craterDepth = 0.294 * Math.pow(finalDiameter, 0.301); // in km
        }

        // Fireball radius (km)
        const fireballRadius = 0.002 * Math.pow(kineticEnergy, 1/3) / 1000;

        // Thermal radiation range
        const thermalRange = 3.38 * Math.pow(kineticEnergy, 0.5) / 10000000; // in km

        // Seismic magnitude
        const seismicMagnitude = 0.67 * Math.log10(kineticEnergy) - 5.87;

        // Ejecta range
        const ejectaRange = 2 * transientDiameter; // in km

        // Air-blast range (Neglecting air pressure of magnitude < 6900 Pa)
        const airblastRange = 1.487 * Math.pow(energyKilotons, 1/3); // in km

        // Recurrence interval
        const recurrenceInterval = 1e9 * Math.pow(energyMegatons, 0.78);

        // Population calculations
        const populationDensity = populationData.density; // people per km²

        // Casualty calculations (simplified estimates)
        const craterDeaths = Math.PI * Math.pow(Math.round(finalDiameter / 2), 2) * populationDensity * 1; // Crater Zone (100% mortality)
        const fireballDeaths = Math.PI * Math.pow(Math.round(fireballRadius - finalDiameter), 2) * populationDensity * 1; // Fireball Zone (100% mortality)
        const ejectaDeaths = Math.PI * Math.pow(Math.round(ejectaRange - fireballRadius), 2) * populationDensity * 0.01; // Ejecta Zone (~1% mortality)
        const airblastDeaths = Math.PI * Math.pow(Math.round(airblastRange - ejectaRange), 2) * populationDensity * 0.1; // Air Blast (~10% mortality)
        const thermalDeaths = Math.PI * Math.pow(Math.round(thermalRange - airblastRange), 2) * populationDensity * 0.1; // Thermal Radiation (~10% mortality)

        const totalDeaths = craterDeaths + fireballDeaths + thermalDeaths + ejectaDeaths + airblastDeaths;
        const severeInjuries = Math.round(totalDeaths * 0.8);
        const minorInjuries = Math.round(totalDeaths * 1.5);

        // Risk assessment
        let riskLevel = 'Low';
        let riskClass = 'risk-low';
        if (totalDeaths > 100000) {
            riskLevel = 'High';
            riskClass = 'risk-high';
        } else if (totalDeaths > 10000) {
            riskLevel = 'Moderate';
            riskClass = 'risk-moderate';
        }

        // Environmental effects !!!!!!!
        const ejectaVolume = Math.PI * Math.pow(transientDiameter, 3) / 16; // km³

        // Tsunami calculations for ocean impacts !!!!!!
        let tsunamiData = null;
        if (this.isOceanImpact) {
            tsunamiData = this.calculateTsunamiEffects(transientDiameter, kineticEnergy);
        }

        const results = {
            energy: energyMegatons, // in MTNT
            finalDiameter, // in km
            fireballRadius, // in km
            affectedPopulation: totalDeaths + severeInjuries + minorInjuries,
            craterDeaths,
            fireballDeaths,
            ejectaDeaths,
            airblastDeaths,
            thermalDeaths,
            totalDeaths,
            severeInjuries,
            minorInjuries,
            riskLevel,
            riskClass,
            seismicMagnitude,
            ejectaVolume, // in km^3
            populationDensity,
            recurrenceInterval, // in years
            physics: {
                finalDiameter, // in km
                fireballRadius, // in km
                airblastRange, // in km
                thermalRange, // in km
                ejectaRange, // in km
                seismicMagnitude,
                tsunami: tsunamiData
            }
        };

        return results;
    }

    // Calculate tsunami effects for ocean impacts
    calculateTsunamiEffects(transientDiameter, kineticEnergy) {
        // GET ACTUAL WATER DEPTH FROM USER INPUT
        const waterDepth = this.currentWaterDepth || WATER_DEPTH_CONFIG.default; // in m

        console.log(`Calculating tsunami with water depth: ${waterDepth}m`);

        // Rim wave generation (using actual water depth)
        const rimWaveMaxAmplitude = Math.min(transientDiameter * 1000 / 14.1, waterDepth); // meters

        // Collapse wave generation if applicable (using actual water depth)
        const collapseWaveMaxAmplitude = 0.06 * Math.min(transientDiameter * 1000 / Math.sqrt(2), waterDepth); // meters

        // Wave speed in deep vs shallow water (using actual water depth)
        const wavelength = transientDiameter * 1000; // Approximate wavelength in m
        let waveSpeedDeep, waveSpeedShallow;
        if (waterDepth > wavelength * 0.05) {
            // Deep water conditions
            waveSpeedDeep = Math.sqrt(this.constants.g * wavelength / (2 * Math.PI)); // m/s
            waveSpeedShallow = Math.sqrt(9.81 * waterDepth); // m/s (shallow water approximation)
        } else {
            // Shallow water conditions throughout
            waveSpeedDeep = Math.sqrt(9.81 * waterDepth); // m/s
            waveSpeedShallow = waveSpeedDeep;
        }

        // Energy transferred to tsunami (~ 0.1-1 % of total impact energy)
        const tsunamiEnergy = kineticEnergy * 0.001; // in J

        // Define impact zone
        const baseAmplitude = Math.max(rimWaveMaxAmplitude, collapseWaveMaxAmplitude); // in m
        const A_thresh = 10; // in m
        const tsunamiRange = (transientDiameter * Math.pow(baseAmplitude / A_thresh, 2) / 2); // in km

        // Arrival time calculation (depth affects wave speed)
        const averageWaveSpeed = (waveSpeedDeep + waveSpeedShallow) / 2;
        const arrivalTime = (100000 / averageWaveSpeed) / 60; // Assume 100km to coast, convert to minutes

        return {
            rimWaveMaxAmplitude, // in m
            collapseWaveMaxAmplitude, // in m
            waveSpeedDeep, // in m/s
            waveSpeedShallow, // in m/s
            tsunamiEnergy, // in J
            tsunamiRange, // in km
            arrivalTime, // in min
            waterDepth, // in m
            wavelength, // in m
        };
    }

    updateResultsDisplay(results) {
        // Physical Effects tab
        document.getElementById('total-energy').textContent = results.energy.toFixed(2);
        document.getElementById('crater-diameter').textContent = results.physics.finalDiameter.toFixed(2);
        document.getElementById('fireball-radius').textContent = `${results.fireballRadius.toFixed(2)} km`;
        document.getElementById('ejecta-range').textContent = `${results.physics.ejectaRange.toFixed(2)} km`;
        document.getElementById('airblast-range').textContent = `${results.physics.airblastRange.toFixed(2)} km`;
        document.getElementById('thermal-range').textContent = `${results.physics.thermalRange.toFixed(2)} km`;
        document.getElementById('seismic-magnitude').textContent = results.seismicMagnitude.toFixed(1);
        document.getElementById('ejecta-volume').textContent = results.ejectaVolume.toFixed(2);

        let atmosphericEffects;
        if (results.energy > 100) {
            atmosphericEffects = 'Significant dust and debris injection into atmosphere, potential regional climate effects';
        } else if (results.energy > 10) {
            atmosphericEffects = 'Moderate dust injection, localized atmospheric disturbance';
        } else {
            atmosphericEffects = 'Minimal atmospheric disturbance';
        }
        document.getElementById('atmospheric-effects').textContent = atmosphericEffects;

        // Casualties tab
        document.getElementById('affected-population').textContent = results.affectedPopulation.toLocaleString();
        
        const riskElement = document.getElementById('risk-level');
        riskElement.textContent = results.riskLevel;
        riskElement.className = `metric-value ${results.riskClass}`;

        document.getElementById('crater-deaths').textContent = results.craterDeaths.toLocaleString();
        document.getElementById('fireball-deaths').textContent = results.fireballDeaths.toLocaleString();
        document.getElementById('ejecta-deaths').textContent = results.ejectaDeaths.toLocaleString();
        document.getElementById('airblast-deaths').textContent = results.airblastDeaths.toLocaleString();
        document.getElementById('thermal-deaths').textContent = results.thermalDeaths.toLocaleString();
        document.getElementById('total-deaths').textContent = results.totalDeaths.toLocaleString();
        document.getElementById('severe-injuries').textContent = results.severeInjuries.toLocaleString();

        // Update tsunami tab content if ocean impact
        if (this.isOceanImpact && results.physics.tsunami) {
            this.updateTsunamiTabContent(results.physics.tsunami);
        }
    }

    // Update tsunami tab content
    updateTsunamiTabContent(tsunamiData) {
        if (!tsunamiData) return;
        
        // Update metric values
        document.getElementById('tsunami-max-height').textContent = 
            Math.max(tsunamiData.rimWaveMaxAmplitude, tsunamiData.collapseWaveMaxAmplitude || 0).toFixed(1);
        
        // const maxRadius = Math.max(...Object.values(tsunamiData.zones).map(z => z.radius));
        // document.getElementById('tsunami-impact-radius').textContent = maxRadius.toFixed(1);

        document.getElementById('tsunami-range').textContent =
            (tsunamiData.tsunamiRange || 0).toFixed(0); // in km

        if (tsunamiData.waterDepth > tsunamiData.wavelength * 0.05) {
            // Deep water conditions
            document.getElementById('tsunami-wave-speed').textContent =
                (tsunamiData.waveSpeedDeep || 0).toFixed(0); // in m/s
        } else {
            // Shallow water conditions throughout
            document.getElementById('tsunami-wave-speed').textContent =
                (tsunamiData.waveSpeedShallow || 0).toFixed(0); // in m/s
        }

        document.getElementById('tsunami-arrival-time').textContent = 
            tsunamiData.arrivalTime.toFixed(0); // in min
        
        // Update physics details
        const physicsContainer = document.getElementById('tsunami-physics-details');
        physicsContainer.innerHTML = `
            <div class="physics-grid">
                <div class="physics-item">
                    <strong>Rim Wave Generation:</strong> 
                    Amplitude = min(Dtc * 1000 / 14.1, H) = ${tsunamiData.rimWaveMaxAmplitude.toFixed(1)} m
                </div>
                <div class="physics-item">
                    <strong>Collapse Wave Generation:</strong> 
                    Amplitude = 0.06 × min(dtc, H) = ${(tsunamiData.collapseWaveMaxAmplitude || 0).toFixed(1)} m
                </div>
                <div class="physics-item">
                    <strong>Energy Conversion:</strong> 
                    ${(tsunamiData.tsunamiEnergy / 1e15).toFixed(2)} × 10¹⁵ J transferred to waves
                </div>
            </div>
        `;
    }

    switchTab(tabName) {
        // Update button states
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panel visibility
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
}

// Global function for water depth preset buttons (called from HTML)
function setWaterDepth(depth) {
    const slider = document.getElementById('water-depth-slider');
    const display = document.getElementById('water-depth-value');

    if (slider && display) {
        slider.value = depth;
        display.textContent = depth;

        // Update active preset button styling
        document.querySelectorAll('#water-depth-group .preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Find and highlight the clicked preset
        const clickedBtn = event?.target.closest('.preset-btn');
        if (clickedBtn) {
            clickedBtn.classList.add('active');
        }

        // Update stored value if simulator exists
        if (window.simulator) {
            window.simulator.currentWaterDepth = depth;
        }

        console.log(`🌊 Water depth preset selected: ${depth}m`);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.simulator = new AsteroidImpactSimulator();
});