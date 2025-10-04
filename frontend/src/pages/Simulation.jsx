import React, { useState, useEffect } from 'react'
import { Play, RotateCcw, Download, Settings, AlertTriangle, Zap, Globe, BarChart3 } from 'lucide-react'
import { useSimulation } from '../context/SimulationContext'
import { simulationService, formatNumber, formatEnergy, formatDistance, getRiskLevelColor, getRiskLevelIcon } from '../services/simulationService'
import { toast } from 'react-hot-toast'

const Simulation = () => {
  const {
    simulationParams,
    impactMetrics,
    environmentalData,
    loading,
    error,
    setSimulationParams,
    setImpactMetrics,
    setEnvironmentalData,
    setLoading,
    setError,
    clearError
  } = useSimulation()

  const [activeTab, setActiveTab] = useState('parameters')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const runSimulation = async () => {
    try {
      setLoading(true)
      clearError()

      const response = await simulationService.simulateImpact(simulationParams)
      
      if (response.success) {
        setImpactMetrics(response.impact_metrics)
        setEnvironmentalData(response.environmental_data)
        toast.success('Simulation completed successfully!')
        setActiveTab('results')
      } else {
        throw new Error(response.error || 'Simulation failed')
      }
    } catch (error) {
      setError(error.message)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetSimulation = () => {
    setSimulationParams({
      diameter_m: 100,
      velocity_km_s: 17,
      density_kg_m3: 3000,
      impact_angle_deg: 45,
      impact_lat: 0,
      impact_lon: 0,
    })
    setImpactMetrics(null)
    setEnvironmentalData(null)
    clearError()
    setActiveTab('parameters')
  }

  const updateParameter = (key, value) => {
    setSimulationParams({ [key]: value })
  }

  const tabs = [
    { id: 'parameters', name: 'Parameters', icon: Settings },
    { id: 'results', name: 'Results', icon: BarChart3 },
    { id: 'environmental', name: 'Environmental', icon: Globe },
  ]

  return (
    <div className="min-h-screen bg-space-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-nasa font-bold text-white mb-4">
            Asteroid Impact Simulation
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Configure asteroid parameters and simulate realistic impact scenarios with comprehensive physics calculations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Parameters */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Simulation Parameters</h2>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Parameters */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Diameter: {simulationParams.diameter_m}m
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="2000"
                    value={simulationParams.diameter_m}
                    onChange={(e) => updateParameter('diameter_m', Number(e.target.value))}
                    className="slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1m</span>
                    <span>2km</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Velocity: {simulationParams.velocity_km_s} km/s
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="80"
                    value={simulationParams.velocity_km_s}
                    onChange={(e) => updateParameter('velocity_km_s', Number(e.target.value))}
                    className="slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 km/s</span>
                    <span>80 km/s</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Density: {simulationParams.density_kg_m3} kg/m³
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="8000"
                    value={simulationParams.density_kg_m3}
                    onChange={(e) => updateParameter('density_kg_m3', Number(e.target.value))}
                    className="slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>500</span>
                    <span>8000</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Impact Angle: {simulationParams.impact_angle_deg}°
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={simulationParams.impact_angle_deg}
                    onChange={(e) => updateParameter('impact_angle_deg', Number(e.target.value))}
                    className="slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5°</span>
                    <span>90°</span>
                  </div>
                </div>

                {/* Advanced Parameters */}
                {showAdvanced && (
                  <div className="space-y-4 pt-4 border-t border-gray-700">
                    <h3 className="text-lg font-medium text-white">Advanced Parameters</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Impact Latitude: {simulationParams.impact_lat}°
                      </label>
                      <input
                        type="number"
                        min="-90"
                        max="90"
                        step="0.1"
                        value={simulationParams.impact_lat}
                        onChange={(e) => updateParameter('impact_lat', Number(e.target.value))}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Impact Longitude: {simulationParams.impact_lon}°
                      </label>
                      <input
                        type="number"
                        min="-180"
                        max="180"
                        step="0.1"
                        value={simulationParams.impact_lon}
                        onChange={(e) => updateParameter('impact_lon', Number(e.target.value))}
                        className="input-field"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-6 border-t border-gray-700">
                  <button
                    onClick={runSimulation}
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>Run Simulation</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={resetSimulation}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            <div className="card">
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-700 rounded-lg p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-nasa-blue text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* Tab Content */}
              <div className="min-h-[600px]">
                {activeTab === 'parameters' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold text-white mb-4">Current Parameters</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-lg font-medium text-white mb-2">Physical Properties</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Diameter:</span>
                              <span className="text-white">{formatNumber(simulationParams.diameter_m)}m</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Density:</span>
                              <span className="text-white">{formatNumber(simulationParams.density_kg_m3)} kg/m³</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Velocity:</span>
                              <span className="text-white">{formatNumber(simulationParams.velocity_km_s)} km/s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Impact Angle:</span>
                              <span className="text-white">{simulationParams.impact_angle_deg}°</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-lg font-medium text-white mb-2">Impact Location</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Latitude:</span>
                              <span className="text-white">{simulationParams.impact_lat}°</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Longitude:</span>
                              <span className="text-white">{simulationParams.impact_lon}°</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-5 h-5 text-blue-400" />
                        <h4 className="text-lg font-medium text-blue-400">Ready to Simulate</h4>
                      </div>
                      <p className="text-blue-200 text-sm">
                        Click "Run Simulation" to calculate impact effects including energy release, crater formation, 
                        seismic effects, and environmental damage.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'results' && (
                  <div className="space-y-6">
                    {impactMetrics ? (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-semibold text-white">Simulation Results</h3>
                          <button className="btn-secondary flex items-center space-x-2">
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                          </button>
                        </div>

                        {/* Risk Assessment */}
                        <div className={`rounded-lg p-4 border-2 ${getRiskLevelColor(impactMetrics.risk_level)}`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl">{getRiskLevelIcon(impactMetrics.risk_level)}</span>
                            <h4 className="text-xl font-semibold">Risk Level: {impactMetrics.risk_level.toUpperCase()}</h4>
                          </div>
                          <p className="text-sm opacity-90">
                            {impactMetrics.advice?.join(' ') || 'Risk assessment completed.'}
                          </p>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-white mb-2">Energy Release</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Kinetic Energy:</span>
                                <span className="text-white">{formatEnergy(impactMetrics.kinetic_energy_j, 'joules')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">TNT Equivalent:</span>
                                <span className="text-white">{formatEnergy(impactMetrics.energy_tnt_tons, 'tnt_tons')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-white mb-2">Crater Formation</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Diameter:</span>
                                <span className="text-white">{formatDistance(impactMetrics.crater_diameter_km)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Depth:</span>
                                <span className="text-white">{formatDistance(impactMetrics.crater_depth_km)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-white mb-2">Seismic Effects</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Magnitude:</span>
                                <span className="text-white">{formatNumber(impactMetrics.seismic_magnitude, 1)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Damage Zones */}
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-lg font-medium text-white mb-4">Damage Zones</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="severe-damage rounded-lg p-3">
                              <h5 className="font-medium text-red-400 mb-1">Severe Damage</h5>
                              <p className="text-sm text-red-300">
                                Complete destruction within {formatDistance(impactMetrics.severe_damage_radius_km)}
                              </p>
                            </div>
                            <div className="moderate-damage rounded-lg p-3">
                              <h5 className="font-medium text-orange-400 mb-1">Moderate Damage</h5>
                              <p className="text-sm text-orange-300">
                                Structural damage within {formatDistance(impactMetrics.moderate_damage_radius_km)}
                              </p>
                            </div>
                            <div className="light-damage rounded-lg p-3">
                              <h5 className="font-medium text-yellow-400 mb-1">Light Damage</h5>
                              <p className="text-sm text-yellow-300">
                                Broken windows within {formatDistance(impactMetrics.light_damage_radius_km)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Environmental Effects */}
                        {impactMetrics.tsunami_potential && (
                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-white mb-2">Tsunami Potential</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Initial Wave Height:</span>
                                <span className="text-white">{formatNumber(impactMetrics.tsunami_potential.initial_wave_height_m)}m</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Max Runup Height:</span>
                                <span className="text-white">{formatNumber(impactMetrics.tsunami_potential.max_runup_height_m)}m</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Affected Coast:</span>
                                <span className="text-white">{formatDistance(impactMetrics.tsunami_potential.affected_coast_km)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Zap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-400 mb-2">No Simulation Results</h3>
                        <p className="text-gray-500">
                          Run a simulation to see detailed impact analysis and damage assessments.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'environmental' && (
                  <div className="space-y-6">
                    {environmentalData ? (
                      <>
                        <h3 className="text-2xl font-semibold text-white">Environmental Analysis</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-white mb-2">Elevation Data</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Elevation:</span>
                                <span className="text-white">{formatNumber(environmentalData.elevation.elevation_m)}m</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Terrain Type:</span>
                                <span className="text-white">{environmentalData.elevation.terrain_type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Population Density:</span>
                                <span className="text-white">{environmentalData.elevation.population_density}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-white mb-2">Seismic Data</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Seismic Zone:</span>
                                <span className="text-white">{environmentalData.seismic.seismic_zone}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Fault Proximity:</span>
                                <span className="text-white">{formatDistance(environmentalData.seismic.fault_proximity_km)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Globe className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-400 mb-2">No Environmental Data</h3>
                        <p className="text-gray-500">
                          Environmental analysis is available when impact coordinates are specified.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Simulation
