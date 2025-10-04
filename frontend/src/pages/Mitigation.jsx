import React, { useState } from 'react'
import { Shield, Zap, Target, Clock, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { useSimulation } from '../context/SimulationContext'
import { mitigationService, formatNumber, formatDistance } from '../services/simulationService'
import { toast } from 'react-hot-toast'
import MitigationVisualization3D from '../components/MitigationVisualization3D'

const Mitigation = () => {
  const { simulationParams, impactMetrics, setLoading, setError } = useSimulation()
  const [selectedMethod, setSelectedMethod] = useState('kinetic_impactor')
  const [timeToImpact, setTimeToImpact] = useState(365) // days
  const [deflectionResults, setDeflectionResults] = useState(null)
  const [loading, setLoadingState] = useState(false)
  const [show3DView, setShow3DView] = useState(true)
  const [animateVisualization, setAnimateVisualization] = useState(false)

  const deflectionMethods = [
    {
      id: 'kinetic_impactor',
      name: 'Kinetic Impactor',
      description: 'High-speed spacecraft collision to change asteroid trajectory',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      pros: ['Proven technology', 'Relatively low cost', 'Quick deployment'],
      cons: ['Limited deflection', 'Requires precise targeting', 'Single-use']
    },
    {
      id: 'gravity_tractor',
      name: 'Gravity Tractor',
      description: 'Spacecraft hovers near asteroid using gravitational attraction',
      icon: Shield,
      color: 'from-green-500 to-green-600',
      pros: ['Very precise control', 'No physical contact', 'Reversible'],
      cons: ['Long mission duration', 'High fuel requirements', 'Complex operations']
    },
    {
      id: 'nuclear',
      name: 'Nuclear Deflection',
      description: 'Nuclear explosion near asteroid to alter its course',
      icon: Zap,
      color: 'from-red-500 to-red-600',
      pros: ['High energy output', 'Effective for large asteroids', 'Fast results'],
      cons: ['Political concerns', 'Fragmentation risk', 'International approval needed']
    }
  ]

  const runDeflectionAnalysis = async () => {
    if (!impactMetrics) {
      toast.error('Please run an impact simulation first')
      return
    }

    try {
      setLoadingState(true)
      
      // Create asteroid data from simulation parameters
      const asteroidData = {
        diameter_m: simulationParams.diameter_m,
        mass_kg: impactMetrics.mass_kg,
        velocity_km_s: simulationParams.velocity_km_s,
        density_kg_m3: simulationParams.density_kg_m3
      }

      // Default deflection parameters based on method
      let deflectionParams = {}
      if (selectedMethod === 'kinetic_impactor') {
        deflectionParams = {
          impactor_mass_kg: 1000,
          impactor_velocity_km_s: 10,
          impact_angle_deg: 90
        }
      } else if (selectedMethod === 'gravity_tractor') {
        deflectionParams = {
          spacecraft_mass_kg: 10000,
          tractor_distance_m: 100,
          thrust_N: 1000
        }
      } else if (selectedMethod === 'nuclear') {
        deflectionParams = {
          yield_kt: 1,
          detonation_distance_m: 100,
          detonation_angle_deg: 0
        }
      }

      const response = await mitigationService.computeDeflection(
        asteroidData,
        selectedMethod,
        deflectionParams,
        timeToImpact
      )

      if (response.success) {
        setDeflectionResults(response.deflection_scenario)
        toast.success('Deflection analysis completed!')
      } else {
        throw new Error(response.error || 'Deflection analysis failed')
      }
    } catch (error) {
      setError(error.message)
      toast.error(error.message)
    } finally {
      setLoadingState(false)
    }
  }

  const compareAllMethods = async () => {
    if (!impactMetrics) {
      toast.error('Please run an impact simulation first')
      return
    }

    try {
      setLoadingState(true)
      
      const asteroidData = {
        diameter_m: simulationParams.diameter_m,
        mass_kg: impactMetrics.mass_kg,
        velocity_km_s: simulationParams.velocity_km_s,
        density_kg_m3: simulationParams.density_kg_m3
      }

      const response = await mitigationService.compareDeflectionMethods(
        asteroidData,
        timeToImpact
      )

      if (response.success) {
        setDeflectionResults(response.comparison)
        toast.success('Method comparison completed!')
      } else {
        throw new Error(response.error || 'Method comparison failed')
      }
    } catch (error) {
      setError(error.message)
      toast.error(error.message)
    } finally {
      setLoadingState(false)
    }
  }

  return (
    <div className="min-h-screen bg-space-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-nasa font-bold text-white mb-4">
            Asteroid Deflection Analysis
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Analyze different mitigation strategies to prevent asteroid impacts and protect Earth
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Method Selection */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-2xl font-semibold text-white mb-6">Deflection Methods</h2>
              
              <div className="space-y-4 mb-6">
                {deflectionMethods.map((method) => {
                  const Icon = method.icon
                  const isSelected = selectedMethod === method.id
                  
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-nasa-blue bg-blue-900/20'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{method.name}</h3>
                          <p className="text-sm text-gray-400">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Time to Impact */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time to Impact: {timeToImpact} days
                </label>
                <input
                  type="range"
                  min="30"
                  max="3650"
                  value={timeToImpact}
                  onChange={(e) => setTimeToImpact(Number(e.target.value))}
                  className="slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>30 days</span>
                  <span>10 years</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={runDeflectionAnalysis}
                  disabled={loading || !impactMetrics}
                  className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Analyze Method</span>
                    </>
                  )}
                </button>

                <button
                  onClick={compareAllMethods}
                  disabled={loading || !impactMetrics}
                  className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Target className="w-5 h-5" />
                  <span>Compare All Methods</span>
                </button>
              </div>

              {!impactMetrics && (
                <div className="mt-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 text-sm">
                      Run an impact simulation first to analyze deflection methods
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">Deflection Analysis Results</h2>
                <button
                  onClick={() => setShow3DView(!show3DView)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {show3DView ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{show3DView ? 'Hide' : 'Show'} 3D View</span>
                </button>
              </div>
              
              {/* 3D Visualization */}
              {show3DView && deflectionResults && deflectionResults.deflection_method && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-white">3D Visualization</h3>
                    <button
                      onClick={() => setAnimateVisualization(!animateVisualization)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      {animateVisualization ? 'Stop' : 'Start'} Animation
                    </button>
                  </div>
                  <div className="relative">
                    <MitigationVisualization3D
                      method={selectedMethod}
                      deflectionData={deflectionResults}
                      animate={animateVisualization}
                    />
                  </div>
                </div>
              )}
              
              {deflectionResults ? (
                <div className="space-y-6">
                  {deflectionResults.deflection_method ? (
                    // Single method results
                    <div>
                      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                        <h3 className="text-xl font-semibold text-white mb-4">
                          {deflectionResults.deflection_method.replace('_', ' ').toUpperCase()} Analysis
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-lg font-medium text-white mb-2">Deflection Parameters</h4>
                            <div className="space-y-2 text-sm">
                              {Object.entries(deflectionResults).map(([key, value]) => {
                                if (typeof value === 'number' && key.includes('_')) {
                                  return (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-gray-400 capitalize">
                                        {key.replace(/_/g, ' ')}:
                                      </span>
                                      <span className="text-white">
                                        {formatNumber(value)} {key.includes('distance') ? 'km' : key.includes('mass') ? 'kg' : key.includes('velocity') ? 'km/s' : ''}
                                      </span>
                                    </div>
                                  )
                                }
                                return null
                              })}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-lg font-medium text-white mb-2">Results</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Delta V:</span>
                                <span className="text-white">{formatNumber(deflectionResults.delta_v_ms)} m/s</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Deflection Distance:</span>
                                <span className="text-white">{formatDistance(deflectionResults.deflection_distance_km)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Miss Distance:</span>
                                <span className="text-white">{formatDistance(deflectionResults.miss_distance_km)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Success Probability:</span>
                                <span className="text-white">{(deflectionResults.success_probability * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={`mt-4 p-4 rounded-lg ${
                          deflectionResults.deflection_successful 
                            ? 'bg-green-900/20 border border-green-500/30' 
                            : 'bg-red-900/20 border border-red-500/30'
                        }`}>
                          <div className="flex items-center space-x-2">
                            {deflectionResults.deflection_successful ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-400" />
                            )}
                            <span className={`font-medium ${
                              deflectionResults.deflection_successful ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {deflectionResults.deflection_successful 
                                ? 'Deflection Successful - Earth Impact Avoided' 
                                : 'Deflection Insufficient - Earth Impact Still Possible'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Comparison results
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Method Comparison</h3>
                      
                      <div className="space-y-4">
                        {['kinetic_impactor', 'gravity_tractor', 'nuclear'].map((method) => {
                          const methodData = deflectionResults[method]
                          if (!methodData) return null
                          
                          return (
                            <div key={method} className="bg-gray-700/50 rounded-lg p-4">
                              <h4 className="text-lg font-medium text-white mb-2">
                                {method.replace('_', ' ').toUpperCase()}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">Success Probability:</span>
                                  <span className="text-white ml-2">{(methodData.success_probability * 100).toFixed(1)}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Delta V:</span>
                                  <span className="text-white ml-2">{formatNumber(methodData.delta_v_ms)} m/s</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Miss Distance:</span>
                                  <span className="text-white ml-2">{formatDistance(methodData.miss_distance_km)}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-blue-400 font-medium mb-2">Recommended Method</h4>
                        <p className="text-blue-200">
                          {deflectionResults.recommended_method?.replace('_', ' ').toUpperCase()} - 
                          Highest success probability for this scenario
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">No Deflection Analysis</h3>
                  <p className="text-gray-500">
                    Select a deflection method and run analysis to see detailed results and recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mitigation
