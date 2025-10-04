# Enhanced Impact Map - Casualty Analysis Integration

## Overview

The Impact Map has been enhanced with comprehensive casualty analysis, population density estimation, and historical context - matching the functionality from the `index.html` source file.

## New Features Added ✅

### 1. **Two-Tab Interface**
- **Physical Effects Tab**: Shows traditional damage zones with mortality rates
- **Casualties Tab**: Displays detailed casualty estimates and historical context

### 2. **Population Analysis**
- **Real-time Population Density Estimation**: Calculates based on proximity to major cities
- **Location Type Classification**: Identifies urban, suburban, rural, or remote areas
- **Smart Estimation Algorithm**: Uses distance-based decay from known population centers

### 3. **Casualty Calculations**
- **Zone-based Mortality Rates**:
  - Thermal Zone: 85% mortality
  - Air Blast Zone: 35% mortality
  - Seismic Zone: 2% mortality
- **Population Exposure**: Calculated per effect zone
- **Total Casualty Estimates**: Aggregated across all zones

### 4. **Historical Context**
- Compares estimated casualties to major disasters:
  - 2004 Indian Ocean Tsunami (230,000)
  - 2010 Haiti Earthquake (158,000)
  - 1976 Tangshan Earthquake (242,000)
- Provides context-appropriate messaging

### 5. **Interactive Effect Zones**
- **Toggle Visibility**: Show/hide individual effect zones
- **Mortality Rates Displayed**: Each zone shows its mortality percentage
- **Casualty Estimates in Popups**: Hover over zones to see detailed statistics

### 6. **Enhanced Popups**
- Population density display
- Individual zone casualty estimates
- Radius information
- Mortality rates

## How It Works

### Population Density Estimation

```javascript
// Major cities database
const cities = [
  { lat: 35.6762, lon: 139.6503, density: 14500, name: "Tokyo, Japan" },
  { lat: 19.0760, lon: 72.8777, density: 31700, name: "Mumbai, India" },
  // ... more cities
]

// Proximity-based estimation
if (distance < 0.5) => Major Urban Area (full city density)
else if (distance < 2.0) => Suburban Area (30% of city density)
else if (distance < 5.0) => Regional Settlement (10% of city density)
else => Rural area (climate-based estimation)
```

### Casualty Calculation Algorithm

```javascript
// 1. Calculate affected area per zone
craterArea = π × (crater_radius)²
thermalArea = π × (thermal_radius)² - craterArea
airblastArea = π × (airblast_radius)² - thermalArea - craterArea
seismicArea = π × (seismic_radius)² - previous areas

// 2. Estimate population per zone
zonePopulation = zoneArea × populationDensity

// 3. Apply mortality rates
casualties = zonePopulation × mortalityRate
```

## User Interface

### Tabs
- Click "Physical Effects" to see effect zones and toggles
- Click "Casualties" to see casualty breakdown and context

### Panels

#### Population Analysis Card
- Shows current location type
- Displays population density for selected impact location

#### Physical Effects Card (Physical Tab)
- Impact metrics (energy, crater size, risk level)
- Toggleable effect zones with mortality rates
- Click checkboxes to show/hide zones

#### Casualty Estimates Card (Casualties Tab)
- **Total Casualties**: Large prominent display
- **Breakdown by Zone**:
  - 🔥 Thermal Zone
  - 💨 Air Blast Zone
  - 🌊 Seismic Zone
- **Historical Context**: Comparison to real disasters

### Effect Zone Colors

| Zone | Border Color | Fill Color | Opacity | Mortality |
|------|--------------|------------|---------|-----------|
| Thermal | #DC2626 (Red) | #FCA5A5 (Light Red) | 45% | 85% |
| Air Blast | #F97316 (Orange) | #FED7AA (Light Orange) | 35% | 35% |
| Seismic | #FBBF24 (Yellow) | #FEF3C7 (Light Yellow) | 25% | 2% |

## Automatic Integration with Simulation

When a simulation is run:

1. **Location Selected**: Click on map
2. **Population Calculated**: Automatically estimates density
3. **Simulation Run**: Backend calculates impact metrics
4. **Casualties Computed**: Frontend calculates using impact data + population
5. **Display Updated**: Both tabs show relevant information

## Usage Flow

### Step 1: Run Simulation
```
Navigate to Simulation page → Enter parameters → Run simulation
```

### Step 2: View Impact Map
```
Navigate to Impact Map → Map automatically shows last simulation
```

### Step 3: Analyze Results
```
Physical Effects Tab:
- View damage zones
- Toggle visibility
- Check radii

Casualties Tab:
- See total casualties
- Review breakdown by zone
- Read historical context
```

### Step 4: Explore Different Locations
```
Click anywhere on map → See updated:
- Population density
- Casualty estimates
- Effect zones
```

## Technical Implementation

### New State Variables
```javascript
const [activeTab, setActiveTab] = useState('physical')
const [showEffectZones, setShowEffectZones] = useState({
  crater: true,
  thermal: true,
  airblast: true,
  ejecta: true,
  seismic: true
})
const [populationDensity, setPopulationDensity] = useState(0)
const [locationType, setLocationType] = useState('Unknown')
const [casualtyEstimates, setCasualtyEstimates] = useState(null)
```

### Key Functions

#### estimatePopulationDensity(lat, lng)
Returns: `{ density: number, type: string }`
- Finds closest major city
- Estimates density based on distance
- Classifies location type

#### calculateCasualties(metrics, popDensity)
Returns: Casualty breakdown object
- Calculates area per zone
- Applies population density
- Computes casualties using mortality rates

#### formatNumber(num)
Returns: Formatted string (e.g., "1.2M", "350K")
- Formats large numbers for readability

#### getHistoricalContext()
Returns: Context string
- Compares to historical disasters
- Provides appropriate messaging

## Data Sources

### Population Centers (Built-in)
- Tokyo, Japan - 14,500 persons/km²
- Mumbai, India - 31,700 persons/km²
- New York, USA - 8,300 persons/km²
- London, UK - 5,700 persons/km²

### Mortality Rates (Scientific Literature)
- **Crater Zone**: 100% (complete vaporization)
- **Thermal Zone**: 85% (lethal radiation/heat)
- **Air Blast Zone**: 35% (structural collapse, debris)
- **Seismic Zone**: 2% (secondary injuries)

## Future Enhancements (Optional)

1. **Real Population Data API**
   - Integrate with NASA's SEDAC GPWv4
   - Use actual population raster data

2. **Time-of-Day Adjustment**
   - Day: 100% density (people at work/school)
   - Night: 60% density (people at home)
   - Rush hour: 120% density (concentrated)

3. **Building Vulnerability**
   - Differentiate urban vs rural construction
   - Account for earthquake-resistant buildings
   - Factor in warning time for evacuation

4. **Tsunami Modeling** (for ocean impacts)
   - Coastal inundation zones
   - Wave height estimation
   - Additional casualty calculations

5. **Economic Impact**
   - Infrastructure damage costs
   - GDP impact assessment
   - Recovery time estimation

## Comparison with Source

### From index.html/app.js ✅
- ✅ Population density overlay
- ✅ Casualty calculations
- ✅ Mortality rates per zone
- ✅ Historical context
- ✅ Effect zone toggles
- ✅ Location type detection
- ✅ Multiple damage zones

### React Implementation Advantages
- ✅ Better state management
- ✅ Component-based architecture
- ✅ Integrated with existing simulation
- ✅ Modern UI with Tailwind
- ✅ Responsive design
- ✅ Tab-based organization

## Testing Checklist

- [ ] Click on map updates population density
- [ ] Tab switching works correctly
- [ ] Effect zone toggles show/hide circles
- [ ] Casualty estimates display correctly
- [ ] Historical context changes based on casualties
- [ ] Popups show zone-specific information
- [ ] Number formatting works (K, M, B)
- [ ] Different locations show different densities
- [ ] Urban areas show higher casualties
- [ ] Remote areas show lower casualties

## Summary

The Impact Map now provides comprehensive casualty analysis matching the functionality from the source files. Users can:

1. **See realistic population estimates** based on location
2. **View detailed casualty projections** by effect zone
3. **Compare impact** to historical disasters
4. **Toggle effect zones** for clearer visualization
5. **Switch between tabs** for different information types

This enhancement makes the Impact Map a powerful tool for understanding the human cost of asteroid impacts, providing scientifically-grounded casualty estimates and meaningful context for decision-makers and educators.
