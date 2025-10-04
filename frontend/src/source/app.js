// Enhanced Asteroid Impact Casualty Simulation with Population Analysis

class EnhancedAsteroidImpactCasualtySimulation {
    constructor() {
        this.map = null;
        this.impactMarker = null;
        this.effectZones = {};
        this.tsunamiZones = {};
        this.populationOverlay = null;
        this.impactLocation = null;
        this.isSelectingLocation = false;
        this.calculatedResults = null;
        this.casualtyResults = null;
        this.isOceanImpact = false;
        this.currentTab = 'physical';
        f
        // Physical constants
        this.constants = {
            g: 9.81, // gravity (m/s²)
            earthRadius: 6371000, // Earth radius in meters
            waterDensity: 1000, // kg/m³
            seawaterBulkModulus: 2300000000, // Pa
            soundSpeedWater: 1530 // m/s
        };
        
        // Tsunami parameters from scientific literature
        this.tsunamiParams = {
            energyConversionEfficiency: 0.01, // 1% of kinetic energy
            rimWaveDistanceFactor: 0.75, // 3*Dtc/4
            collapseWaveDistanceFactor: 2.5, // 5*Dtc/2
            deepWaterThreshold: 0.5, // H > λ/2
            shallowWaterThreshold: 0.05 // H < λ/20
        };
        
        // Population density data (simulating GPW v4.11 dataset)
        this.populationData = {
            tokyo: { lat: 35.6762, lon: 139.6503, density: 14500, name: "Tokyo, Japan" },
            mumbai: { lat: 19.0760, lon: 72.8777, density: 31700, name: "Mumbai, India" },
            dhaka: { lat: 23.8103, lon: 90.4125, density: 28400, name: "Dhaka, Bangladesh" },
            manila: { lat: 14.5995, lon: 120.9842, density: 21600, name: "Manila, Philippines" },
            new_york: { lat: 40.7128, lon: -74.0060, density: 8300, name: "New York, USA" },
            london: { lat: 51.5074, lon: -0.1278, density: 5700, name: "London, UK" },
            paris: { lat: 48.8566, lon: 2.3522, density: 3800, name: "Paris, France" },
            rural_kansas: { lat: 39.0119, lon: -98.4842, density: 15, name: "Rural Kansas, USA" },
            sahara: { lat: 23.4162, lon: 25.6628, density: 0.5, name: "Sahara Desert" },
            amazon: { lat: -3.4653, lon: -62.2159, density: 2, name: "Amazon Rainforest" }
        };
        
        // Mortality rates based on scientific literature
        this.mortalityRates = {
            crater: 1.0, // 100% mortality in crater zone
            fireball: 0.85, // 85% mortality from thermal effects
            airblast: 0.35, // 35% mortality from air blast
            seismic: 0.02, // 2% mortality from seismic effects
            tsunami: 0.45 // 45% average mortality from tsunami
        };
        
        // Historical disaster comparisons
        this.historicalDisasters = [
            { name: "2004 Indian Ocean Tsunami", casualties: 230000, type: "natural" },
            { name: "2010 Haiti Earthquake", casualties: 158000, type: "natural" },
            { name: "1976 Tangshan Earthquake", casualties: 242000, type: "natural" },
            { name: "1815 Mount Tambora Eruption", casualties: 71000, type: "natural" },
            { name: "1883 Krakatoa Eruption", casualties: 36000, type: "natural" },
            { name: "Tunguska Event (1908)", casualties: 0, type: "impact" },
            { name: "Chelyabinsk Meteor (2013)", casualties: 1500, type: "impact" }
        ];
        
        // Effect zone colors and properties
        this.zoneConfig = {
            crater: { color: '#8B4513', name: 'Crater Formation', opacity: 0.3 },
            fireball: { color: '#FF8C00', name: 'Fireball/Thermal', opacity: 0.25 },
            airblast: { color: '#FFD700', name: 'Air Blast Wave', opacity: 0.2 },
            ejecta: { color: '#808080', name: 'Ejecta Deposition', opacity: 0.15 },
            seismic: { color: '#00FFFF', name: 'Seismic Shaking', opacity: 0.1 }
        };
        
        // Tsunami damage zones with scientific classification
        this.tsunamiZoneConfig = {
            zone1: { color: '#87CEEB', name: '1-3m waves', description: 'Minor coastal flooding', opacity: 0.25 },
            zone2: { color: '#4682B4', name: '3-10m waves', description: 'Significant inundation', opacity: 0.25 },
            zone3: { color: '#191970', name: '10-30m waves', description: 'Severe tsunami damage', opacity: 0.25 },
            zone4: { color: '#000080', name: '>30m waves', description: 'Catastrophic mega-tsunami', opacity: 0.25 }
        };
        
        this.init();
    }
    
    init() {
        console.log('Initializing Enhanced Asteroid Impact Casualty Simulation...');
        this.initMap();
        this.bindEvents();
        this.updateParameterDisplays();
        this.initTabs();
        this.createPopulationOverlay(); // Create population overlay by default
    }
    
    initMap() {
        console.log('Initializing map...');
        // Initialize Leaflet map
        this.map = L.map('map').setView([20, 0], 2);
        
        // Use OpenStreetMap with fallback
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 2
        });
        
        osmLayer.addTo(this.map);
        
        // Add click handler for impact location selection
        this.map.on('click', (e) => {
            if (this.isSelectingLocation) {
                console.log('Impact location selected:', e.latlng);
                this.setImpactLocation(e.latlng);
            }
        });
        
        // Ensure map renders properly
        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize();
                console.log('Map initialized successfully');
            }
        }, 500);
    }
    
    initTabs() {
        console.log('Initializing tabs...');
        const physicalTab = document.getElementById('physical-tab');
        const casualtiesTab = document.getElementById('casualties-tab');
        
        if (physicalTab) {
            physicalTab.addEventListener('click', () => this.switchTab('physical'));
        }
        if (casualtiesTab) {
            casualtiesTab.addEventListener('click', () => this.switchTab('casualties'));
        }
        
        // Set initial tab state
        this.switchTab('physical');
    }
    
    switchTab(tab) {
        console.log('Switching to tab:', tab);
        this.currentTab = tab;
        
        // Update tab buttons
        const physicalTab = document.getElementById('physical-tab');
        const casualtiesTab = document.getElementById('casualties-tab');
        const physicalResults = document.getElementById('physical-results');
        const casualtyResults = document.getElementById('casualty-results');
        
        if (physicalTab) physicalTab.classList.toggle('active', tab === 'physical');
        if (casualtiesTab) casualtiesTab.classList.toggle('active', tab === 'casualties');
        
        // Show appropriate content
        if (physicalResults) physicalResults.style.display = tab === 'physical' ? 'block' : 'none';
        if (casualtyResults) casualtyResults.style.display = tab === 'casualties' ? 'block' : 'none';
    }
    
    bindEvents() {
        console.log('Binding events...');
        
        // Parameter sliders
        const diameterSlider = document.getElementById('diameter-slider');
        const velocitySlider = document.getElementById('velocity-slider');
        const angleSlider = document.getElementById('angle-slider');
        const waterDepthSlider = document.getElementById('water-depth-slider');
        const targetSelect = document.getElementById('target-select');
        
        // Bind slider events
        [diameterSlider, velocitySlider, angleSlider, waterDepthSlider].forEach(slider => {
            if (slider) {
                slider.addEventListener('input', (e) => {
                    e.stopPropagation();
                    this.updateParameterDisplays();
                });
                
                slider.addEventListener('change', (e) => {
                    e.stopPropagation();
                    this.updateParameterDisplays();
                });
            }
        });
        
        // Target type selection - show/hide water depth
        if (targetSelect) {
            targetSelect.addEventListener('change', (e) => {
                this.updateTargetType(e.target.value);
            });
        }
        
        // Population overlay toggle
        const populationToggle = document.getElementById('population-overlay-toggle');
        if (populationToggle) {
            populationToggle.addEventListener('change', (e) => {
                this.togglePopulationOverlay(e.target.checked);
            });
        }
        
        // Action buttons
        const selectBtn = document.getElementById('select-location-btn');
        const calculateBtn = document.getElementById('calculate-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        if (selectBtn) {
            selectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Select location button clicked');
                this.toggleLocationSelection();
            });
        } else {
            console.error('Select location button not found!');
        }
        
        if (calculateBtn) {
            calculateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Calculate button clicked');
                this.calculateEffects();
            });
        } else {
            console.error('Calculate button not found!');
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Reset button clicked');
                this.resetSimulation();
            });
        }
        
        // Effect zone toggles
        ['crater', 'fireball', 'airblast', 'ejecta', 'seismic', 'tsunami'].forEach(zone => {
            const toggle = document.getElementById(`${zone}-toggle`);
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    this.toggleEffectZone(zone, e.target.checked);
                });
            }
        });
        
        console.log('Events bound successfully');
    }
    
    updateParameterDisplays() {
        const diameterSlider = document.getElementById('diameter-slider');
        const velocitySlider = document.getElementById('velocity-slider');
        const angleSlider = document.getElementById('angle-slider');
        const waterDepthSlider = document.getElementById('water-depth-slider');
        
        const diameterValue = document.getElementById('diameter-value');
        const velocityValue = document.getElementById('velocity-value');
        const angleValue = document.getElementById('angle-value');
        const waterDepthValue = document.getElementById('water-depth-value');
        
        if (diameterSlider && diameterValue) {
            diameterValue.textContent = diameterSlider.value;
        }
        if (velocitySlider && velocityValue) {
            velocityValue.textContent = velocitySlider.value;
        }
        if (angleSlider && angleValue) {
            angleValue.textContent = angleSlider.value;
        }
        if (waterDepthSlider && waterDepthValue) {
            waterDepthValue.textContent = waterDepthSlider.value;
        }
    }
    
    updateTargetType(targetValue) {
        const waterDepthGroup = document.getElementById('water-depth-group');
        const isOcean = parseFloat(targetValue) === 1000; // Ocean density
        
        if (waterDepthGroup) {
            waterDepthGroup.style.display = isOcean ? 'block' : 'none';
        }
    }
    
    toggleLocationSelection() {
        const btn = document.getElementById('select-location-btn');
        const status = document.getElementById('map-status');
        
        console.log('Toggling location selection. Current state:', this.isSelectingLocation);
        
        if (!this.isSelectingLocation) {
            this.isSelectingLocation = true;
            if (btn) {
                btn.classList.add('btn--active');
                btn.innerHTML = '<i class="fas fa-times"></i> Cancel Selection';
            }
            if (status) {
                status.textContent = 'Click on the map to select impact location';
            }
            if (this.map) {
                this.map.getContainer().style.cursor = 'crosshair';
            }
        } else {
            this.isSelectingLocation = false;
            if (btn) {
                btn.classList.remove('btn--active');
                btn.innerHTML = '<i class="fas fa-crosshairs"></i> Select Impact Location';
            }
            if (status) {
                status.textContent = 'Click "Select Impact Location" then click on the map';
            }
            if (this.map) {
                this.map.getContainer().style.cursor = '';
            }
        }
    }
    
    setImpactLocation(latlng) {
        console.log('Setting impact location:', latlng);
        this.impactLocation = latlng;
        
        // Remove existing marker
        if (this.impactMarker && this.map) {
            this.map.removeLayer(this.impactMarker);
        }
        
        // Create custom marker
        const markerIcon = L.divIcon({
            className: 'impact-marker',
            html: '<i class="fas fa-meteor"></i>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        if (this.map) {
            this.impactMarker = L.marker(latlng, { icon: markerIcon }).addTo(this.map);
        }
        
        // Check if impact is over ocean and get population data
        this.isOceanImpact = this.isLocationOverOcean(latlng);
        const populationInfo = this.getPopulationDensity(latlng);
        
        console.log('Population info:', populationInfo);
        console.log('Is ocean impact:', this.isOceanImpact);
        
        // Update UI
        this.toggleLocationSelection();
        
        const coordsDisplay = document.getElementById('coordinates-display');
        const impactLocation = document.getElementById('impact-location');
        const oceanIndicator = document.getElementById('ocean-indicator');
        const calculateBtn = document.getElementById('calculate-btn');
        const mapStatus = document.getElementById('map-status');
        const populationDensity = document.getElementById('population-density');
        const locationType = document.getElementById('location-type');
        
        if (coordsDisplay) {
            coordsDisplay.textContent = `${latlng.lat.toFixed(4)}°, ${latlng.lng.toFixed(4)}°`;
        }
        if (impactLocation) {
            impactLocation.style.display = 'block';
        }
        if (oceanIndicator) {
            oceanIndicator.style.display = this.isOceanImpact ? 'block' : 'none';
        }
        if (calculateBtn) {
            calculateBtn.disabled = false;
            calculateBtn.classList.remove('btn--secondary');
            calculateBtn.classList.add('btn--primary');
        }
        if (mapStatus) {
            const locType = this.isOceanImpact ? 'ocean' : 'land';
            mapStatus.textContent = `Impact location selected (${locType}). Click "Calculate Effects & Casualties" to run simulation.`;
        }
        if (populationDensity) {
            populationDensity.textContent = `${populationInfo.density.toLocaleString()} persons/km²`;
        }
        if (locationType) {
            locationType.textContent = populationInfo.type;
        }
        
        console.log('Impact location set successfully');
    }
    
    getPopulationDensity(latlng) {
        const lat = latlng.lat;
        const lng = latlng.lng;
        
        // Find closest reference point for realistic density estimation
        let closestDistance = Infinity;
        let closestPoint = null;
        
        Object.values(this.populationData).forEach(point => {
            const distance = Math.sqrt(
                Math.pow(lat - point.lat, 2) + Math.pow(lng - point.lon, 2)
            );
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = point;
            }
        });
        
        // Calculate density based on distance and geographical factors
        let estimatedDensity;
        let locationType;
        
        if (this.isLocationOverOcean(latlng)) {
            estimatedDensity = 0;
            locationType = "Ocean";
        } else if (closestDistance < 0.5) { // Very close to a known city
            estimatedDensity = closestPoint.density;
            locationType = "Major urban area";
        } else if (closestDistance < 2.0) { // Near a major city
            estimatedDensity = Math.max(500, closestPoint.density * 0.3);
            locationType = "Suburban area";
        } else if (closestDistance < 5.0) { // Regional influence
            estimatedDensity = Math.max(50, closestPoint.density * 0.1);
            locationType = "Regional settlement";
        } else {
            // Very remote - determine by latitude (climate zones)
            const absLat = Math.abs(lat);
            if (absLat < 30) { // Tropical regions
                estimatedDensity = Math.random() * 50 + 10; // 10-60
                locationType = "Rural tropical";
            } else if (absLat < 60) { // Temperate regions
                estimatedDensity = Math.random() * 30 + 5; // 5-35
                locationType = "Rural temperate";
            } else { // Arctic/Antarctic regions
                estimatedDensity = Math.random() * 2 + 0.1; // 0.1-2
                locationType = "Remote/Arctic";
            }
        }
        
        return {
            density: Math.round(estimatedDensity),
            type: locationType,
            nearestCity: closestPoint ? closestPoint.name : "Unknown"
        };
    }
    
    isLocationOverOcean(latlng) {
        // Simplified ocean detection - in a real app, you'd use a proper ocean/land dataset
        const lat = latlng.lat;
        const lng = latlng.lng;
        
        // Major landmass boundaries (very simplified)
        const landAreas = [
            // North America
            { latMin: 25, latMax: 72, lngMin: -160, lngMax: -50 },
            // South America
            { latMin: -55, latMax: 15, lngMin: -85, lngMax: -30 },
            // Europe/Asia
            { latMin: 35, latMax: 75, lngMin: -10, lngMax: 180 },
            // Africa
            { latMin: -35, latMax: 38, lngMin: -20, lngMax: 52 },
            // Australia
            { latMin: -45, latMax: -10, lngMin: 110, lngMax: 155 }
        ];
        
        for (let area of landAreas) {
            if (lat >= area.latMin && lat <= area.latMax && 
                lng >= area.lngMin && lng <= area.lngMax) {
                return false; // Over land
            }
        }
        
        return true; // Assume ocean
    }
    
    togglePopulationOverlay(show) {
        if (show && !this.populationOverlay) {
            this.createPopulationOverlay();
        } else if (!show && this.populationOverlay) {
            if (this.map) {
                this.map.removeLayer(this.populationOverlay);
            }
            this.populationOverlay = null;
        }
    }
    
    createPopulationOverlay() {
        console.log('Creating population overlay...');
        // Create visual representation of population density
        const populationMarkers = [];
        
        Object.values(this.populationData).forEach(point => {
            if (point.density > 100) { // Show all significant population centers
                const markerSize = Math.min(50, Math.max(10, Math.sqrt(point.density) / 20));
                const opacity = Math.min(0.8, Math.max(0.3, point.density / 50000));
                
                const circle = L.circle([point.lat, point.lon], {
                    radius: markerSize * 1000,
                    fillColor: '#FF6B6B',
                    color: '#FF3333',
                    weight: 2,
                    opacity: 0.9,
                    fillOpacity: opacity,
                    className: 'population-density-overlay'
                }).bindPopup(`${point.name}<br/>Density: ${point.density.toLocaleString()} persons/km²`);
                
                populationMarkers.push(circle);
            }
        });
        
        if (populationMarkers.length > 0) {
            this.populationOverlay = L.layerGroup(populationMarkers);
            if (this.map) {
                this.populationOverlay.addTo(this.map);
                console.log('Population overlay created with', populationMarkers.length, 'markers');
            }
        }
    }
    
    calculateEffects() {
        if (!this.impactLocation) {
            console.error('No impact location selected');
            return;
        }
        
        console.log('Starting effects calculation...');
        
        const btn = document.getElementById('calculate-btn');
        if (btn) {
            btn.classList.add('calculating');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
            btn.disabled = true;
        }
        
        // Get parameters
        const parameters = this.getParameters();
        console.log('Parameters:', parameters);
        
        // Perform calculations
        setTimeout(() => {
            try {
                this.calculatedResults = this.performCalculations(parameters);
                this.casualtyResults = this.calculateCasualties(parameters, this.calculatedResults);
                
                console.log('Calculated results:', this.calculatedResults);
                console.log('Casualty results:', this.casualtyResults);
                
                this.displayResults();
                this.drawEffectZones();
                
                if (btn) {
                    btn.classList.remove('calculating');
                    btn.innerHTML = '<i class="fas fa-calculator"></i> Recalculate Effects & Casualties';
                    btn.disabled = false;
                }
                
                const mapStatus = document.getElementById('map-status');
                if (mapStatus) {
                    const effectType = this.isOceanImpact ? 'Impact, tsunami effects, and casualty estimates' : 'Impact effects and casualty estimates';
                    mapStatus.textContent = `${effectType} calculated and displayed.`;
                }
                
                // Show results tabs and switch to casualties
                const resultsContent = document.getElementById('results-content');
                if (resultsContent) {
                    resultsContent.style.display = 'none';
                }
                this.switchTab('casualties'); // Start with casualties tab for impact
                
                console.log('Effects calculation completed successfully');
            } catch (error) {
                console.error('Error during calculation:', error);
                if (btn) {
                    btn.classList.remove('calculating');
                    btn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Effects & Casualties';
                    btn.disabled = false;
                }
            }
        }, 2000);
    }
    
    getParameters() {
        const diameterSlider = document.getElementById('diameter-slider');
        const densitySelect = document.getElementById('density-select');
        const velocitySlider = document.getElementById('velocity-slider');
        const angleSlider = document.getElementById('angle-slider');
        const targetSelect = document.getElementById('target-select');
        const waterDepthSlider = document.getElementById('water-depth-slider');
        const timeOfDaySelect = document.getElementById('time-of-day-select');
        
        const diameter = diameterSlider ? parseFloat(diameterSlider.value) : 100;
        const density = densitySelect ? parseFloat(densitySelect.value) : 2700;
        const velocity = velocitySlider ? parseFloat(velocitySlider.value) * 1000 : 20000; // Convert to m/s
        const angle = angleSlider ? parseFloat(angleSlider.value) * Math.PI / 180 : Math.PI/4; // Convert to radians
        const targetDensity = targetSelect ? parseFloat(targetSelect.value) : 2750;
        const waterDepth = waterDepthSlider ? parseFloat(waterDepthSlider.value) : 2000;
        const timeOfDayFactor = timeOfDaySelect ? parseFloat(timeOfDaySelect.value) : 1.0;
        
        const radius = diameter / 2;
        const volume = (4/3) * Math.PI * Math.pow(radius, 3);
        const mass = density * volume;
        
        // Get local population density
        const populationInfo = this.getPopulationDensity(this.impactLocation);
        
        return {
            diameter: diameter,
            radius: radius,
            mass: mass,
            density: density,
            velocity: velocity,
            angle: angle,
            targetDensity: targetDensity,
            waterDepth: waterDepth,
            timeOfDayFactor: timeOfDayFactor,
            populationDensity: populationInfo.density,
            isOceanImpact: this.isOceanImpact
        };
    }
    
    performCalculations(params) {
        const results = {};
        
        // 1. Kinetic Energy (Joules)
        results.kineticEnergy = 0.5 * params.mass * Math.pow(params.velocity, 2);
        
        // TNT equivalent (1 ton TNT = 4.184 × 10^9 J)
        results.tntEquivalent = results.kineticEnergy / (4.184e9);
        
        // 2. Transient Crater Diameter (Collins et al. 2005)
        const L = params.diameter;
        const vi = params.velocity / 1000; // Convert back to km/s for formula
        const g = this.constants.g;
        const rho_i = params.density;
        const rho_t = params.targetDensity;
        const theta = params.angle;
        
        results.transientDiameter = 1.161 * Math.pow(rho_i / rho_t, 1/3) * 
            Math.pow((Math.pow(L, 0.78) * Math.pow(vi, 0.44)) / Math.pow(g, 0.22), 1/3) * 
            Math.pow(Math.sin(theta), 1/3);
        
        // Final crater diameter (empirical scaling)
        if (results.transientDiameter < 3000) {
            results.finalDiameter = results.transientDiameter * 1.25;
        } else {
            results.finalDiameter = results.transientDiameter * 1.3;
        }
        
        // Crater depth formula
        results.craterDepth = 0.294 * Math.pow(results.finalDiameter, 0.301);
        
        // 3. Fireball radius (km)
        results.fireballRadius = 0.002 * Math.pow(results.kineticEnergy, 1/3) / 1000;
        
        // Thermal radiation range
        results.thermalRange = results.fireballRadius * 5;
        
        // 4. Seismic magnitude
        results.seismicMagnitude = 0.67 * Math.log10(results.kineticEnergy) - 5.87;
        
        // Seismic shaking range
        results.seismicRange = Math.pow(10, (results.seismicMagnitude - 3) / 3) * 10;
        
        // 5. Air blast range
        const blastYield = results.tntEquivalent;
        results.airblastRange = Math.pow(blastYield, 1/3) * 2;
        
        // 6. Ejecta range
        results.ejectaRange = results.finalDiameter * 20 / 1000;
        
        // 7. Tsunami calculations (only for ocean impacts)
        if (params.isOceanImpact) {
            results.tsunami = this.calculateTsunamiEffects(params, results);
        }
        
        // 8. Recurrence interval
        const EMt = results.kineticEnergy / (4.2e15);
        results.recurrenceInterval = Math.pow(10, 9) * Math.pow(EMt, 0.78);
        
        return results;
    }
    
    calculateTsunamiEffects(params, impactResults) {
        const tsunami = {};
        const H = params.waterDepth; // Water depth
        const Dtc = impactResults.transientDiameter; // Transient crater diameter
        const dtc = impactResults.craterDepth; // Crater depth
        const g = this.constants.g;
        
        // Rim wave amplitude: Amax_rw = min(Dtc/14.1, H)
        tsunami.rimWaveMaxAmplitude = Math.min(Dtc / 14.1, H);
        
        // Collapse wave amplitude: Amax_cw = 0.06 * min(dtc, H) for H > 2*L
        if (H > 2 * params.diameter) {
            tsunami.collapseWaveMaxAmplitude = 0.06 * Math.min(dtc, H);
        } else {
            tsunami.collapseWaveMaxAmplitude = 0;
        }
        
        // Wave characteristic distances
        tsunami.rimWaveDistance = this.tsunamiParams.rimWaveDistanceFactor * Dtc;
        tsunami.collapseWaveDistance = this.tsunamiParams.collapseWaveDistanceFactor * Dtc;
        
        // Wave speed calculations
        const wavelength = tsunami.rimWaveDistance * 2;
        
        if (H > wavelength * this.tsunamiParams.deepWaterThreshold) {
            tsunami.waveSpeedDeep = Math.sqrt(g * wavelength / (2 * Math.PI));
        } else {
            tsunami.waveSpeedDeep = Math.sqrt(g * H);
        }
        
        // Energy conversion
        tsunami.tsunamiEnergy = impactResults.kineticEnergy * this.tsunamiParams.energyConversionEfficiency;
        
        // Arrival time to coast
        const coastalDistance = 100000; // 100 km in meters
        tsunami.arrivalTime = coastalDistance / tsunami.waveSpeedDeep / 60; // minutes
        
        // Wave height zones for visualization
        tsunami.zones = this.calculateTsunamiZones(tsunami, impactResults);
        
        return tsunami;
    }
    
    calculateTsunamiZones(tsunami, impactResults) {
        const zones = {};
        const maxWaveHeight = Math.max(tsunami.rimWaveMaxAmplitude, tsunami.collapseWaveMaxAmplitude);
        
        const baseRadius = Math.max(tsunami.rimWaveDistance, tsunami.collapseWaveDistance) / 1000; // km
        
        zones.zone1 = {
            radius: baseRadius * 0.5,
            waveHeight: Math.max(1, maxWaveHeight * 0.3)
        };
        zones.zone2 = {
            radius: baseRadius * 0.3,
            waveHeight: Math.max(3, maxWaveHeight * 0.6)
        };
        zones.zone3 = {
            radius: baseRadius * 0.2,
            waveHeight: Math.max(10, maxWaveHeight * 0.8)
        };
        zones.zone4 = {
            radius: baseRadius * 0.1,
            waveHeight: Math.max(30, maxWaveHeight)
        };
        
        return zones;
    }
    
    calculateCasualties(params, results) {
        const casualties = {};
        const populationDensity = params.populationDensity * params.timeOfDayFactor;
        
        // Calculate area and population for each effect zone
        casualties.crater = this.calculateZoneCasualties(
            results.finalDiameter / 2000, // radius in km
            populationDensity,
            this.mortalityRates.crater
        );
        
        // For overlapping zones, calculate annular areas
        const craterRadius = results.finalDiameter / 2000;
        const thermalRadius = results.thermalRange;
        const airblastRadius = results.airblastRange;
        const seismicRadius = results.seismicRange;
        
        // Thermal zone (excluding crater)
        casualties.thermal = this.calculateAnnularCasualties(
            craterRadius, thermalRadius, populationDensity, this.mortalityRates.fireball
        );
        
        // Air blast zone (excluding thermal and crater)
        casualties.airblast = this.calculateAnnularCasualties(
            thermalRadius, airblastRadius, populationDensity, this.mortalityRates.airblast
        );
        
        // Seismic zone (excluding all inner zones)
        casualties.seismic = this.calculateAnnularCasualties(
            airblastRadius, seismicRadius, populationDensity, this.mortalityRates.seismic
        );
        
        // Tsunami casualties (for ocean impacts)
        if (params.isOceanImpact && results.tsunami) {
            const maxTsunamiRadius = Math.max(...Object.values(results.tsunami.zones).map(z => z.radius));
            casualties.tsunami = this.calculateZoneCasualties(
                maxTsunamiRadius,
                populationDensity * 0.3, // Coastal population factor
                this.mortalityRates.tsunami
            );
        } else {
            casualties.tsunami = { population: 0, casualties: 0, radius: 0 };
        }
        
        // Total casualties
        casualties.total = casualties.crater.casualties + 
                          casualties.thermal.casualties + 
                          casualties.airblast.casualties + 
                          casualties.seismic.casualties + 
                          casualties.tsunami.casualties;
        
        // Total population exposed
        casualties.populationExposed = casualties.crater.population + 
                                     casualties.thermal.population + 
                                     casualties.airblast.population + 
                                     casualties.seismic.population + 
                                     casualties.tsunami.population;
        
        // Uncertainty bounds (±72% as per scientific literature)
        casualties.uncertaintyRange = casualties.total * 0.72;
        
        // Affected area
        casualties.affectedArea = Math.PI * Math.pow(seismicRadius, 2);
        
        // Average population density
        casualties.averageDensity = casualties.populationExposed / casualties.affectedArea;
        
        return casualties;
    }
    
    calculateZoneCasualties(radiusKm, populationDensity, mortalityRate) {
        const area = Math.PI * Math.pow(radiusKm, 2); // km²
        const population = area * populationDensity;
        const casualties = population * mortalityRate;
        
        return {
            radius: radiusKm,
            area: area,
            population: Math.round(population),
            casualties: Math.round(casualties)
        };
    }
    
    calculateAnnularCasualties(innerRadiusKm, outerRadiusKm, populationDensity, mortalityRate) {
        if (outerRadiusKm <= innerRadiusKm) {
            return { radius: outerRadiusKm, area: 0, population: 0, casualties: 0 };
        }
        
        const outerArea = Math.PI * Math.pow(outerRadiusKm, 2);
        const innerArea = Math.PI * Math.pow(innerRadiusKm, 2);
        const area = outerArea - innerArea;
        const population = area * populationDensity;
        const casualties = population * mortalityRate;
        
        return {
            radius: outerRadiusKm,
            area: area,
            population: Math.round(population),
            casualties: Math.round(casualties)
        };
    }
    
    displayResults() {
        console.log('Displaying results...');
        const results = this.calculatedResults;
        const casualties = this.casualtyResults;
        
        if (!results || !casualties) return;
        
        // Update physical results
        this.updatePhysicalResults(results);
        
        // Update casualty results
        this.updateCasualtyResults(casualties);
        
        // Update historical comparison
        this.updateHistoricalComparison(casualties.total);
        
        console.log('Results displayed successfully');
    }
    
    updatePhysicalResults(results) {
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateElement('kinetic-energy', this.formatNumber(results.kineticEnergy) + ' J');
        updateElement('tnt-equivalent', this.formatNumber(results.tntEquivalent) + ' tons TNT');
        updateElement('transient-diameter', this.formatNumber(results.transientDiameter) + ' m');
        updateElement('final-diameter', this.formatNumber(results.finalDiameter) + ' m');
        updateElement('crater-depth', this.formatNumber(results.craterDepth) + ' m');
        updateElement('fireball-radius', this.formatNumber(results.fireballRadius * 1000) + ' m');
        updateElement('thermal-range', this.formatNumber(results.thermalRange) + ' km');
        updateElement('seismic-magnitude', results.seismicMagnitude.toFixed(1));
        updateElement('seismic-range', this.formatNumber(results.seismicRange) + ' km');
        updateElement('airblast-range', this.formatNumber(results.airblastRange) + ' km');
        updateElement('recurrence-interval', this.formatLargeNumber(results.recurrenceInterval) + ' years');
        
        // Tsunami results if ocean impact
        const tsunamiResults = document.getElementById('tsunami-results');
        if (results.tsunami && tsunamiResults) {
            tsunamiResults.style.display = 'block';
            updateElement('rim-wave-height', this.formatNumber(results.tsunami.rimWaveMaxAmplitude) + ' m');
            updateElement('collapse-wave-height', this.formatNumber(results.tsunami.collapseWaveMaxAmplitude) + ' m');
            updateElement('wave-speed', this.formatNumber(results.tsunami.waveSpeedDeep) + ' m/s');
            updateElement('arrival-time', results.tsunami.arrivalTime.toFixed(1) + ' minutes');
        } else if (tsunamiResults) {
            tsunamiResults.style.display = 'none';
        }
    }
    
    updateCasualtyResults(casualties) {
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        // Summary statistics
        updateElement('total-casualties', casualties.total.toLocaleString());
        updateElement('casualty-uncertainty', Math.round(casualties.uncertaintyRange).toLocaleString());
        updateElement('population-exposed', casualties.populationExposed.toLocaleString());
        updateElement('affected-area', Math.round(casualties.affectedArea).toLocaleString() + ' km²');
        updateElement('average-density', Math.round(casualties.averageDensity).toLocaleString() + ' persons/km²');
        
        // Zone-specific casualties
        updateElement('crater-casualty-radius', casualties.crater.radius.toFixed(2) + ' km');
        updateElement('crater-population', casualties.crater.population.toLocaleString());
        updateElement('crater-casualties', casualties.crater.casualties.toLocaleString());
        
        updateElement('thermal-casualty-radius', casualties.thermal.radius.toFixed(1) + ' km');
        updateElement('thermal-population', casualties.thermal.population.toLocaleString());
        updateElement('thermal-casualties', casualties.thermal.casualties.toLocaleString());
        
        updateElement('airblast-casualty-radius', casualties.airblast.radius.toFixed(1) + ' km');
        updateElement('airblast-population', casualties.airblast.population.toLocaleString());
        updateElement('airblast-casualties', casualties.airblast.casualties.toLocaleString());
        
        updateElement('seismic-casualty-radius', casualties.seismic.radius.toFixed(1) + ' km');
        updateElement('seismic-population', casualties.seismic.population.toLocaleString());
        updateElement('seismic-casualties', casualties.seismic.casualties.toLocaleString());
        
        // Tsunami casualties (show/hide based on ocean impact)
        const tsunamiCasualtyZone = document.getElementById('tsunami-casualty-zone');
        if (casualties.tsunami.casualties > 0 && tsunamiCasualtyZone) {
            tsunamiCasualtyZone.style.display = 'block';
            updateElement('tsunami-casualty-radius', casualties.tsunami.radius.toFixed(1) + ' km');
            updateElement('tsunami-population', casualties.tsunami.population.toLocaleString());
            updateElement('tsunami-casualties', casualties.tsunami.casualties.toLocaleString());
        } else if (tsunamiCasualtyZone) {
            tsunamiCasualtyZone.style.display = 'none';
        }
    }
    
    updateHistoricalComparison(totalCasualties) {
        const comparisonElement = document.getElementById('disaster-comparison');
        if (!comparisonElement) return;
        
        let comparison = '';
        
        if (totalCasualties === 0) {
            comparison = 'No casualties expected in this remote location, similar to the 1908 Tunguska Event.';
        } else if (totalCasualties < 1000) {
            comparison = `With ${totalCasualties.toLocaleString()} casualties, this would be comparable to the 2013 Chelyabinsk meteor event (1,500 injured).`;
        } else if (totalCasualties < 50000) {
            comparison = `${totalCasualties.toLocaleString()} casualties would make this a significant regional disaster, comparable to the 1883 Krakatoa eruption (36,000 deaths).`;
        } else if (totalCasualties < 100000) {
            comparison = `${totalCasualties.toLocaleString()} casualties would rank among major natural disasters, similar to the 1815 Mount Tambora eruption (71,000 deaths).`;
        } else if (totalCasualties < 200000) {
            comparison = `${totalCasualties.toLocaleString()} casualties would make this one of the deadliest natural disasters in history, comparable to the 2010 Haiti earthquake (158,000 deaths).`;
        } else if (totalCasualties < 300000) {
            comparison = `${totalCasualties.toLocaleString()} casualties would exceed the 2004 Indian Ocean tsunami (230,000 deaths) and rank as one of the most catastrophic events in recorded history.`;
        } else {
            comparison = `${totalCasualties.toLocaleString()} casualties would represent an unprecedented catastrophe, exceeding all recorded natural disasters in human history.`;
        }
        
        comparisonElement.innerHTML = `<p>${comparison}</p>`;
    }
    
    drawEffectZones() {
        console.log('Drawing effect zones...');
        
        // Clear existing zones
        Object.values(this.effectZones).forEach(zone => {
            if (zone && this.map) this.map.removeLayer(zone);
        });
        Object.values(this.tsunamiZones).forEach(zone => {
            if (zone && this.map) this.map.removeLayer(zone);
        });
        this.effectZones = {};
        this.tsunamiZones = {};
        
        const results = this.calculatedResults;
        const center = this.impactLocation;
        
        if (!results || !center || !this.map) return;
        
        // Create standard effect zones
        const zones = {
            crater: results.finalDiameter / 2000, // Convert to km
            fireball: results.thermalRange,
            airblast: results.airblastRange,
            ejecta: results.ejectaRange,
            seismic: results.seismicRange
        };
        
        // Draw circles for each standard effect zone
        Object.entries(zones).forEach(([zoneName, radiusKm]) => {
            if (radiusKm > 0 && this.zoneConfig[zoneName]) {
                const config = this.zoneConfig[zoneName];
                
                this.effectZones[zoneName] = L.circle(center, {
                    radius: radiusKm * 1000,
                    color: config.color,
                    fillColor: config.color,
                    fillOpacity: config.opacity,
                    weight: 2,
                    className: `effect-zone ${zoneName}-effect`
                }).addTo(this.map);
            }
        });
        
        // Draw tsunami zones if ocean impact
        if (results.tsunami && results.tsunami.zones) {
            this.drawTsunamiZones(results.tsunami.zones, center);
        }
        
        // Show effect toggles and ensure tsunami toggle is visible for ocean impacts
        const effectToggles = document.getElementById('effect-toggles');
        const tsunamiToggleContainer = document.getElementById('tsunami-toggle-container');
        
        if (effectToggles) {
            effectToggles.style.display = 'block';
        }
        
        if (tsunamiToggleContainer) {
            tsunamiToggleContainer.style.display = results.tsunami ? 'block' : 'none';
        }
        
        // Fit map to show all effects
        this.fitMapToEffects();
        
        console.log('Effect zones drawn successfully');
    }
    
    drawTsunamiZones(tsunamiZones, center) {
        const zoneOrder = ['zone1', 'zone2', 'zone3', 'zone4'];
        
        zoneOrder.forEach((zoneName, index) => {
            const zone = tsunamiZones[zoneName];
            const config = Object.values(this.tsunamiZoneConfig)[index];
            
            if (zone && zone.radius > 0) {
                this.tsunamiZones[zoneName] = L.circle(center, {
                    radius: zone.radius * 1000,
                    color: config.color,
                    fillColor: config.color,
                    fillOpacity: config.opacity,
                    weight: 2,
                    className: `effect-zone tsunami-effect-${zoneName}`
                }).addTo(this.map);
            }
        });
    }
    
    fitMapToEffects() {
        if (!this.map || !this.impactLocation) return;
        
        const bounds = L.latLngBounds();
        bounds.extend(this.impactLocation);
        
        // Include all effect zones
        Object.values(this.effectZones).forEach(zone => {
            if (zone && zone.getBounds) {
                bounds.extend(zone.getBounds());
            }
        });
        
        // Include tsunami zones
        Object.values(this.tsunamiZones).forEach(zone => {
            if (zone && zone.getBounds) {
                bounds.extend(zone.getBounds());
            }
        });
        
        this.map.fitBounds(bounds, { padding: [20, 20] });
    }
    
    toggleEffectZone(zoneName, visible) {
        if (zoneName === 'tsunami') {
            // Toggle all tsunami zones
            Object.values(this.tsunamiZones).forEach(zone => {
                if (zone && this.map) {
                    if (visible) {
                        zone.addTo(this.map);
                    } else {
                        this.map.removeLayer(zone);
                    }
                }
            });
        } else {
            // Toggle standard effect zone
            const zone = this.effectZones[zoneName];
            if (zone && this.map) {
                if (visible) {
                    zone.addTo(this.map);
                } else {
                    this.map.removeLayer(zone);
                }
            }
        }
    }
    
    resetSimulation() {
        console.log('Resetting simulation...');
        
        // Clear map elements
        if (this.impactMarker && this.map) {
            this.map.removeLayer(this.impactMarker);
            this.impactMarker = null;
        }
        
        Object.values(this.effectZones).forEach(zone => {
            if (zone && this.map) this.map.removeLayer(zone);
        });
        Object.values(this.tsunamiZones).forEach(zone => {
            if (zone && this.map) this.map.removeLayer(zone);
        });
        this.effectZones = {};
        this.tsunamiZones = {};
        
        if (this.populationOverlay && this.map) {
            this.map.removeLayer(this.populationOverlay);
            this.populationOverlay = null;
        }
        
        // Reset state
        this.impactLocation = null;
        this.isSelectingLocation = false;
        this.calculatedResults = null;
        this.casualtyResults = null;
        this.isOceanImpact = false;
        this.currentTab = 'physical';
        
        // Reset UI
        const updateElement = (id, action, value = null) => {
            const element = document.getElementById(id);
            if (element) {
                if (action === 'hide') element.style.display = 'none';
                else if (action === 'show') element.style.display = 'block';
                else if (action === 'disable') element.disabled = true;
                else if (action === 'text') element.textContent = value;
                else if (action === 'html') element.innerHTML = value;
                else if (action === 'value') element.value = value;
                else if (action === 'removeClass') element.classList.remove(value);
                else if (action === 'checked') element.checked = value;
                else if (action === 'addClass') element.classList.add(value);
            }
        };
        
        updateElement('impact-location', 'hide');
        updateElement('ocean-indicator', 'hide');
        updateElement('effect-toggles', 'hide');
        updateElement('tsunami-toggle-container', 'hide');
        updateElement('results-content', 'show');
        updateElement('physical-results', 'hide');
        updateElement('casualty-results', 'hide');
        updateElement('tsunami-results', 'hide');
        updateElement('tsunami-casualty-zone', 'hide');
        updateElement('water-depth-group', 'hide');
        updateElement('calculate-btn', 'disable');
        updateElement('calculate-btn', 'removeClass', 'btn--primary');
        updateElement('calculate-btn', 'addClass', 'btn--secondary');
        updateElement('calculate-btn', 'html', '<i class="fas fa-calculator"></i> Calculate Effects & Casualties');
        updateElement('map-status', 'text', 'Click "Select Impact Location" then click on the map');
        
        updateElement('select-location-btn', 'removeClass', 'btn--active');
        updateElement('select-location-btn', 'html', '<i class="fas fa-crosshairs"></i> Select Impact Location');
        
        updateElement('population-overlay-toggle', 'checked', true);
        
        if (this.map) {
            this.map.getContainer().style.cursor = '';
            this.map.setView([20, 0], 2);
        }
        
        // Reset parameter sliders to defaults
        updateElement('diameter-slider', 'value', 100);
        updateElement('velocity-slider', 'value', 20);
        updateElement('angle-slider', 'value', 45);
        updateElement('water-depth-slider', 'value', 2000);
        updateElement('density-select', 'value', 2700);
        updateElement('target-select', 'value', 2750);
        updateElement('time-of-day-select', 'value', 1.0);
        
        this.updateParameterDisplays();
        this.switchTab('physical');
        this.createPopulationOverlay(); // Recreate population overlay
        
        console.log('Simulation reset successfully');
    }
    
    formatNumber(num) {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        } else if (num >= 1) {
            return num.toFixed(2);
        } else {
            return num.toExponential(2);
        }
    }
    
    formatLargeNumber(num) {
        if (num >= 1e12) {
            return (num / 1e12).toFixed(1) + ' trillion';
        } else if (num >= 1e9) {
            return (num / 1e9).toFixed(1) + ' billion';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(1) + ' million';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(1) + ' thousand';
        } else {
            return num.toFixed(0);
        }
    }
}

// Initialize the enhanced casualty simulation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing application...');
    window.asteroidApp = new EnhancedAsteroidImpactCasualtySimulation();
});

// Add keyboard shortcuts for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && window.asteroidApp && window.asteroidApp.isSelectingLocation) {
        window.asteroidApp.toggleLocationSelection();
    }
    
    // Tab switching shortcuts
    if (e.key === '1' && e.ctrlKey && window.asteroidApp) {
        e.preventDefault();
        window.asteroidApp.switchTab('physical');
    }
    if (e.key === '2' && e.ctrlKey && window.asteroidApp) {
        e.preventDefault();
        window.asteroidApp.switchTab('casualties');
    }
});

// Handle window resize for responsive map
window.addEventListener('resize', () => {
    if (window.asteroidApp && window.asteroidApp.map) {
        setTimeout(() => {
            window.asteroidApp.map.invalidateSize();
        }, 100);
    }
});