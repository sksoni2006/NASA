// Add this function near the top of your component
import React, { useState, useEffect, useMemo } from 'react'


const openMapApp = () => {
  window.open('/NASA_JPL_NEO_Deflection_App/map.html', '_blank')
}

// Add this button in the header section, right after the description paragraph:
<div className="text-center mb-8">
  <h1 className="text-4xl font-nasa font-bold text-white mb-4">
    Impact Map Visualization
  </h1>
  <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
    Visualize asteroid impact locations on Earth with damage zones, population effects, and environmental analysis
  </p>
  
  {/* Add this button */}
  <button
    onClick={openMapApp}
    className="px-6 py-2 bg-nasa-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
  >
    Open NASA Impact Map
  </button>
  
  {/* ...rest of your existing code... */}
</div>
export default openMapApp




// import React, { useState, useEffect, useMemo } from 'react'
// import { MapContainer, TileLayer, Marker, Circle, Popup, useMapEvents } from 'react-leaflet'
// import { useSimulation } from '../context/SimulationContext'
// import { formatDistance, formatEnergy } from '../services/simulationService'
// import { Users, Activity, Layers, Info, Eye, EyeOff, AlertTriangle } from 'lucide-react'
// import L from 'leaflet'

// // Fix default icon issue
// delete L.Icon.Default.prototype._getIconUrl
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
// })

// const ImpactMap = () => {
//   const { simulationParams, impactMetrics, mapCenter, setMapCenter } = useSimulation()
//   const [map, setMap] = useState(null)
//   const [activeTab, setActiveTab] = useState('physical')
//   const [showEffectZones, setShowEffectZones] = useState({
//     crater: true,
//     thermal: true,
//     airblast: true,
//     ejecta: true,
//     seismic: true
//   })
//   const [populationDensity, setPopulationDensity] = useState(0)
//   const [locationType, setLocationType] = useState('Unknown')
//   const [casualtyEstimates, setCasualtyEstimates] = useState(null)

//   // Update map center when simulation parameters change
//   useEffect(() => {
//     if (simulationParams.impact_lat !== 0 || simulationParams.impact_lon !== 0) {
//       setMapCenter([simulationParams.impact_lat, simulationParams.impact_lon])
//     }
//   }, [simulationParams.impact_lat, simulationParams.impact_lon, setMapCenter])

//   // Update map view when center changes
//   useEffect(() => {
//     if (map && (mapCenter[0] !== 0 || mapCenter[1] !== 0)) {
//       map.setView(mapCenter, 6)
//     }
//   }, [map, mapCenter])
  
//   // Recalculate casualties when impactMetrics or mapCenter changes
//   useEffect(() => {
//     if (impactMetrics) {
//       const lat = mapCenter[0]
//       const lng = mapCenter[1]
//       const popData = estimatePopulationDensity(lat, lng)
//       setPopulationDensity(popData.density)
//       setLocationType(popData.type)
//       const casualties = calculateCasualties(impactMetrics, popData.density)
//       setCasualtyEstimates(casualties)
      
//       // Auto-zoom to show the largest damage zone if we have valid coordinates
//       if (map && impactMetrics.light_damage_radius_km > 0) {
//         // Calculate appropriate zoom level based on damage radius
//         const radiusKm = impactMetrics.light_damage_radius_km
//         let zoom = 2
//         if (radiusKm < 10) zoom = 10
//         else if (radiusKm < 50) zoom = 8
//         else if (radiusKm < 200) zoom = 6
//         else if (radiusKm < 500) zoom = 5
//         else if (radiusKm < 1000) zoom = 4
//         else zoom = 3
        
//         map.setView([lat, lng], zoom)
//       }
//     }
//   }, [impactMetrics, mapCenter, map])

//   const handleMapClick = (e) => {
//     const { lat, lng } = e.latlng
//     setMapCenter([lat, lng])
    
//     // Calculate population density based on location
//     const popData = estimatePopulationDensity(lat, lng)
//     setPopulationDensity(popData.density)
//     setLocationType(popData.type)
    
//     // Calculate casualty estimates
//     if (impactMetrics) {
//       const casualties = calculateCasualties(impactMetrics, popData.density)
//       setCasualtyEstimates(casualties)
//     }
//   }
  
//   // Estimate population density based on coordinates
//   const estimatePopulationDensity = (lat, lng) => {
//     // Major cities data for realistic estimation
//     const cities = [
//       { lat: 35.6762, lon: 139.6503, density: 14500, name: "Tokyo, Japan" },
//       { lat: 19.0760, lon: 72.8777, density: 31700, name: "Mumbai, India" },
//       { lat: 40.7128, lon: -74.0060, density: 8300, name: "New York, USA" },
//       { lat: 51.5074, lon: -0.1278, density: 5700, name: "London, UK" }
//     ]
    
//     // Find closest city
//     let closestDistance = Infinity
//     let closestCity = null
    
//     cities.forEach(city => {
//       const distance = Math.sqrt(
//         Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lon, 2)
//       )
//       if (distance < closestDistance) {
//         closestDistance = distance
//         closestCity = city
//       }
//     })
    
//     // Estimate density based on proximity
//     let density, type
//     if (closestDistance < 0.5) {
//       density = closestCity.density
//       type = "Major Urban Area"
//     } else if (closestDistance < 2.0) {
//       density = Math.max(500, closestCity.density * 0.3)
//       type = "Suburban Area"
//     } else if (closestDistance < 5.0) {
//       density = Math.max(50, closestCity.density * 0.1)
//       type = "Regional Settlement"
//     } else {
//       const absLat = Math.abs(lat)
//       if (absLat < 30) {
//         density = Math.floor(Math.random() * 50 + 10)
//         type = "Rural Tropical"
//       } else if (absLat < 60) {
//         density = Math.floor(Math.random() * 30 + 5)
//         type = "Rural Temperate"
//       } else {
//         density = Math.floor(Math.random() * 2 + 0.1)
//         type = "Remote/Arctic"
//       }
//     }
    
//     return { density: Math.round(density), type }
//   }
  
//   // Calculate casualty estimates
//   const calculateCasualties = (metrics, popDensity) => {
//     const craterArea = Math.PI * Math.pow(metrics.crater_diameter_km / 2, 2)
//     const thermalArea = Math.PI * Math.pow(metrics.severe_damage_radius_km, 2) - craterArea
//     const airblastArea = Math.PI * Math.pow(metrics.moderate_damage_radius_km, 2) - thermalArea - craterArea
//     const seismicArea = Math.PI * Math.pow(metrics.light_damage_radius_km, 2) - airblastArea - thermalArea - craterArea
    
//     // Mortality rates from scientific literature
//     const mortalityRates = {
//       crater: 1.0,
//       thermal: 0.85,
//       airblast: 0.35,
//       seismic: 0.02
//     }
    
//     const craterPop = craterArea * popDensity
//     const thermalPop = thermalArea * popDensity
//     const airblastPop = airblastArea * popDensity
//     const seismicPop = seismicArea * popDensity
    
//     const craterCasualties = craterPop * mortalityRates.crater
//     const thermalCasualties = thermalPop * mortalityRates.thermal
//     const airblastCasualties = airblastPop * mortalityRates.airblast
//     const seismicCasualties = seismicPop * mortalityRates.seismic
    
//     const totalCasualties = craterCasualties + thermalCasualties + airblastCasualties + seismicCasualties
//     const totalPopulation = craterPop + thermalPop + airblastPop + seismicPop
    
//     return {
//       crater: { population: Math.round(craterPop), casualties: Math.round(craterCasualties) },
//       thermal: { population: Math.round(thermalPop), casualties: Math.round(thermalCasualties) },
//       airblast: { population: Math.round(airblastPop), casualties: Math.round(airblastCasualties) },
//       seismic: { population: Math.round(seismicPop), casualties: Math.round(seismicCasualties) },
//       total: { population: Math.round(totalPopulation), casualties: Math.round(totalCasualties) }
//     }
//   }
  
//   // Format large numbers
//   const formatNumber = (num) => {
//     if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
//     if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
//     if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
//     return num.toFixed(0)
//   }
  
//   // Historical context
//   const getHistoricalContext = () => {
//     if (!casualtyEstimates) return null
//     const total = casualtyEstimates.total.casualties
    
//     const disasters = [
//       { name: "2004 Indian Ocean Tsunami", casualties: 230000 },
//       { name: "2010 Haiti Earthquake", casualties: 158000 },
//       { name: "1976 Tangshan Earthquake", casualties: 242000 }
//     ]
    
//     if (total > disasters[0].casualties) {
//       return "This would represent an unprecedented catastrophe, exceeding all recorded natural disasters in human history."
//     } else if (total > 100000) {
//       return "This would be comparable to the most devastating natural disasters in recorded history."
//     } else if (total > 10000) {
//       return "This would be a major disaster requiring international humanitarian response."
//     } else {
//       return "While significant, this impact would be manageable with proper emergency response."
//     }
//   }

//   // Add this function near the top of your component
//   const openMapApp = () => {
//     window.open('/NASA_JPL_NEO_Deflection_App/map.html', '_blank')
//   }

//   return (
//     <div className="min-h-screen bg-space-gradient">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-nasa font-bold text-white mb-4">
//             Impact Map Visualization
//           </h1>
//           <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
//             Visualize asteroid impact locations on Earth with damage zones, population effects, and environmental analysis
//           </p>
          
//           {/* Add this button */}
//           <button
//             onClick={openMapApp}
//             className="px-6 py-2 bg-nasa-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
//           >
//             Open NASA Impact Map
//           </button>
          
//           {!impactMetrics && (
//             <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 max-w-2xl mx-auto mt-4">
//               <div className="flex items-center space-x-2 text-yellow-400">
//                 <AlertTriangle className="w-5 h-5" />
//                 <span className="font-medium">No simulation data available</span>
//               </div>
//               <p className="text-yellow-200 text-sm mt-2">
//                 Please run a simulation from the Simulation page first, then the impact zones will automatically appear here.
//               </p>
//             </div>
//           )}
          
//           {impactMetrics && (
//             <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 max-w-2xl mx-auto mt-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2 text-green-400">
//                   <Info className="w-5 h-5" />
//                   <span className="font-medium">Simulation loaded - Damage zones visible on map</span>
//                 </div>
//                 <button
//                   onClick={() => {
//                     if (map) {
//                       const lat = mapCenter[0] || simulationParams.impact_lat
//                       const lng = mapCenter[1] || simulationParams.impact_lon
//                       setMapCenter([lat, lng])
//                     }
//                   }}
//                   className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
//                 >
//                   Center on Impact
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Tabs */}
//         <div className="flex justify-center mb-6">
//           <div className="inline-flex rounded-lg border border-gray-600 p-1 bg-gray-800">
//             <button
//               onClick={() => setActiveTab('physical')}
//               className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
//                 activeTab === 'physical'
//                   ? 'bg-nasa-blue text-white'
//                   : 'text-gray-400 hover:text-white'
//               }`}
//             >
//               <Activity className="w-4 h-4" />
//               <span>Physical Effects</span>
//             </button>
//             <button
//               onClick={() => setActiveTab('casualties')}
//               className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
//                 activeTab === 'casualties'
//                   ? 'bg-nasa-blue text-white'
//                   : 'text-gray-400 hover:text-white'
//               }`}
//             >
//               <Users className="w-4 h-4" />
//               <span>Casualties</span>
//             </button>
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Map */}
//           <div className="lg:col-span-3">
//             <div className="card h-[600px] p-0 overflow-hidden">
//               <MapContainer
//                 center={mapCenter}
//                 zoom={2}
//                 style={{ height: '100%', width: '100%' }}
//                 whenCreated={setMap}
//                 onClick={handleMapClick}
//               >
//                 <TileLayer
//                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 />
                
//                 {/* Impact marker and damage zones */}
//                 {impactMetrics && (
//                   <>
//                     <Marker 
//                       position={mapCenter}
//                       draggable={true}
//                       eventHandlers={{
//                         dragend: (e) => {
//                           const marker = e.target
//                           const position = marker.getLatLng()
//                           handleMapClick({ latlng: position })
//                         }
//                       }}
//                     >
//                       <Popup>
//                         <div className="text-sm">
//                           <h3 className="font-semibold mb-2">Impact Location</h3>
//                           <p><strong>Latitude:</strong> {mapCenter[0].toFixed(4)}°</p>
//                           <p><strong>Longitude:</strong> {mapCenter[1].toFixed(4)}°</p>
//                           <p><strong>Energy:</strong> {formatEnergy(impactMetrics.energy_tnt_tons, 'tnt_tons')}</p>
//                           <p><strong>Crater:</strong> {formatDistance(impactMetrics.crater_diameter_km)}</p>
//                           <p><strong>Population:</strong> {populationDensity.toLocaleString()} persons/km²</p>
//                           <p className="text-blue-600 font-medium mt-2">💡 Drag me to change location!</p>
//                         </div>
//                       </Popup>
//                     </Marker>
                    
//                     {/* Damage zones - displayed from largest to smallest for proper layering */}
//                     {/* Seismic Zone - Outermost */}
//                     {showEffectZones.seismic && (
//                       <Circle
//                         center={mapCenter}
//                         radius={impactMetrics.light_damage_radius_km * 1000}
//                         pathOptions={{ 
//                           color: '#FBBF24', 
//                           fillColor: '#FEF3C7', 
//                           fillOpacity: 0.25,
//                           weight: 2
//                         }}
//                       >
//                         <Popup>
//                           <div className="text-sm">
//                             <h3 className="font-semibold text-yellow-600 mb-1">Seismic Zone (2% mortality)</h3>
//                             <p>Seismic shaking and minor damage within {formatDistance(impactMetrics.light_damage_radius_km)}</p>
//                             <p className="text-xs text-gray-600 mt-1">Radius: {impactMetrics.light_damage_radius_km.toFixed(2)} km</p>
//                             {casualtyEstimates && (
//                               <p className="text-xs font-semibold text-yellow-700 mt-2">
//                                 Est. casualties: {formatNumber(casualtyEstimates.seismic.casualties)}
//                               </p>
//                             )}
//                           </div>
//                         </Popup>
//                       </Circle>
//                     )}
                    
//                     {/* Air Blast Zone - Middle */}
//                     {showEffectZones.airblast && (
//                       <Circle
//                         center={mapCenter}
//                         radius={impactMetrics.moderate_damage_radius_km * 1000}
//                         pathOptions={{ 
//                           color: '#F97316', 
//                           fillColor: '#FED7AA', 
//                           fillOpacity: 0.35,
//                           weight: 2
//                         }}
//                       >
//                         <Popup>
//                           <div className="text-sm">
//                             <h3 className="font-semibold text-orange-600 mb-1">Air Blast Zone (35% mortality)</h3>
//                             <p>Significant structural damage within {formatDistance(impactMetrics.moderate_damage_radius_km)}</p>
//                             <p className="text-xs text-gray-600 mt-1">Radius: {impactMetrics.moderate_damage_radius_km.toFixed(2)} km</p>
//                             {casualtyEstimates && (
//                               <p className="text-xs font-semibold text-orange-700 mt-2">
//                                 Est. casualties: {formatNumber(casualtyEstimates.airblast.casualties)}
//                               </p>
//                             )}
//                           </div>
//                         </Popup>
//                       </Circle>
//                     )}
                    
//                     {/* Thermal Zone - Innermost */}
//                     {showEffectZones.thermal && (
//                       <Circle
//                         center={mapCenter}
//                         radius={impactMetrics.severe_damage_radius_km * 1000}
//                         pathOptions={{ 
//                           color: '#DC2626', 
//                           fillColor: '#FCA5A5', 
//                           fillOpacity: 0.45,
//                           weight: 3
//                         }}
//                       >
//                         <Popup>
//                           <div className="text-sm">
//                             <h3 className="font-semibold text-red-600 mb-1">Thermal Zone (85% mortality)</h3>
//                             <p>Complete thermal destruction within {formatDistance(impactMetrics.severe_damage_radius_km)}</p>
//                             <p className="text-xs text-gray-600 mt-1">Radius: {impactMetrics.severe_damage_radius_km.toFixed(2)} km</p>
//                             {casualtyEstimates && (
//                               <p className="text-xs font-semibold text-red-700 mt-2">
//                                 Est. casualties: {formatNumber(casualtyEstimates.thermal.casualties)}
//                               </p>
//                             )}
//                           </div>
//                         </Popup>
//                       </Circle>
//                     )}
//                   </>
//                 )}
//               </MapContainer>
//             </div>
//           </div>

//           {/* Controls Panel */}
//           <div className="lg:col-span-1 space-y-6">
//             {/* Population & Location Info */}
//             <div className="card">
//               <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
//                 <Users className="w-5 h-5 mr-2" />
//                 Population Analysis
//               </h2>
              
//               <div className="space-y-4">
//                 <div className="bg-gray-700/50 p-3 rounded-lg">
//                   <div className="text-sm text-gray-400 mb-1">Location Type</div>
//                   <div className="text-lg font-semibold text-white">{locationType}</div>
//                 </div>
                
//                 <div className="bg-gray-700/50 p-3 rounded-lg">
//                   <div className="text-sm text-gray-400 mb-1">Population Density</div>
//                   <div className="text-lg font-semibold text-white">
//                     {populationDensity.toLocaleString()} persons/km²
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Physical Effects Panel */}
//             {activeTab === 'physical' && (
//               <div className="card">
//                 <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
//                   <Activity className="w-5 h-5 mr-2" />
//                   Physical Effects
//                 </h2>
              
//               <div className="space-y-6">
//                 <div>
//                   <h3 className="text-lg font-medium text-white mb-4">Impact Location</h3>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Latitude:</span>
//                       <span className="text-white">{mapCenter[0].toFixed(4)}°</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Longitude:</span>
//                       <span className="text-white">{mapCenter[1].toFixed(4)}°</span>
//                     </div>
//                   </div>
//                   <p className="text-gray-400 text-xs mt-2">
//                     Click on the map to set impact location
//                   </p>
//                 </div>

//                 {impactMetrics && (
//                   <div>
//                     <h3 className="text-lg font-medium text-white mb-4">Impact Analysis</h3>
//                     <div className="space-y-3 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-gray-400">Energy:</span>
//                         <span className="text-white">{formatEnergy(impactMetrics.energy_tnt_tons, 'tnt_tons')}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-400">Crater:</span>
//                         <span className="text-white">{formatDistance(impactMetrics.crater_diameter_km)}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-400">Risk Level:</span>
//                         <span className="text-white capitalize">{impactMetrics.risk_level}</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {impactMetrics && (
//                   <div>
//                     <h3 className="text-lg font-medium text-white mb-4">Effect Zones</h3>
//                     <div className="space-y-3">
//                       <label className="flex items-center space-x-3 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={showEffectZones.thermal}
//                           onChange={(e) => setShowEffectZones(prev => ({ ...prev, thermal: e.target.checked }))}
//                           className="w-4 h-4 rounded"
//                         />
//                         <div className="w-4 h-4 bg-red-500 rounded-full"></div>
//                         <span className="text-sm text-gray-300">Thermal Zone (85% mortality)</span>
//                       </label>
                      
//                       <label className="flex items-center space-x-3 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={showEffectZones.airblast}
//                           onChange={(e) => setShowEffectZones(prev => ({ ...prev, airblast: e.target.checked }))}
//                           className="w-4 h-4 rounded"
//                         />
//                         <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
//                         <span className="text-sm text-gray-300">Air Blast (35% mortality)</span>
//                       </label>
                      
//                       <label className="flex items-center space-x-3 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={showEffectZones.seismic}
//                           onChange={(e) => setShowEffectZones(prev => ({ ...prev, seismic: e.target.checked }))}
//                           className="w-4 h-4 rounded"
//                         />
//                         <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
//                         <span className="text-sm text-gray-300">Seismic Zone (2% mortality)</span>
//                       </label>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//             )}
            
//             {/* Casualty Estimates Panel */}
//             {activeTab === 'casualties' && casualtyEstimates && (
//               <div className="card">
//                 <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
//                   <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
//                   Casualty Estimates
//                 </h2>
                
//                 <div className="space-y-4">
//                   {/* Total Casualties */}
//                   <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
//                     <div className="text-sm text-red-300 mb-1">Total Estimated Casualties</div>
//                     <div className="text-3xl font-bold text-red-400">
//                       {formatNumber(casualtyEstimates.total.casualties)}
//                     </div>
//                     <div className="text-xs text-red-300 mt-1">
//                       of {formatNumber(casualtyEstimates.total.population)} affected
//                     </div>
//                   </div>
                  
//                   {/* Breakdown by Zone */}
//                   <div className="space-y-3">
//                     <h3 className="text-sm font-medium text-gray-400">Breakdown by Effect Zone</h3>
                    
//                     <div className="bg-gray-700/50 p-3 rounded-lg">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="text-sm text-gray-300">🔥 Thermal Zone</span>
//                         <span className="text-sm font-semibold text-red-400">
//                           {formatNumber(casualtyEstimates.thermal.casualties)}
//                         </span>
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         Population: {formatNumber(casualtyEstimates.thermal.population)}
//                       </div>
//                     </div>
                    
//                     <div className="bg-gray-700/50 p-3 rounded-lg">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="text-sm text-gray-300">💨 Air Blast Zone</span>
//                         <span className="text-sm font-semibold text-orange-400">
//                           {formatNumber(casualtyEstimates.airblast.casualties)}
//                         </span>
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         Population: {formatNumber(casualtyEstimates.airblast.population)}
//                       </div>
//                     </div>
                    
//                     <div className="bg-gray-700/50 p-3 rounded-lg">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="text-sm text-gray-300">🌊 Seismic Zone</span>
//                         <span className="text-sm font-semibold text-yellow-400">
//                           {formatNumber(casualtyEstimates.seismic.casualties)}
//                         </span>
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         Population: {formatNumber(casualtyEstimates.seismic.population)}
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Historical Context */}
//                   <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
//                     <h4 className="text-blue-400 font-medium mb-2 flex items-center">
//                       <Info className="w-4 h-4 mr-2" />
//                       Historical Context
//                     </h4>
//                     <p className="text-blue-200 text-sm">
//                       {getHistoricalContext()}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {/* Map Instructions */}
//             <div className="card">
//               <h2 className="text-xl font-semibold text-white mb-4">Map Instructions</h2>
//               <ul className="text-gray-300 text-sm space-y-2">
//                 <li className="flex items-start">
//                   <span className="text-nasa-blue mr-2">•</span>
//                   <span>Click anywhere on the map to update impact location</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-nasa-blue mr-2">•</span>
//                   <span>Use mouse wheel to zoom in/out</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-nasa-blue mr-2">•</span>
//                   <span>Drag to pan around the map</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-nasa-blue mr-2">•</span>
//                   <span>Click on colored circles for zone details</span>
//                 </li>
//                 {impactMetrics && (
//                   <li className="flex items-start text-green-400 mt-4 pt-4 border-t border-gray-700">
//                     <span className="text-green-400 mr-2">✓</span>
//                     <span>Damage zones are visible! Zoom out if you don't see them - they cover {formatDistance(impactMetrics.light_damage_radius_km)} radius</span>
//                   </li>
//                 )}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ImpactMap
