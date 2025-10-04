import React, { useState, useEffect } from 'react'
import { Search, ArrowLeft, ArrowRight, Loader2, Shield, Target, Zap, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import DeflectionSimulation3D from '../components/DeflectionSimulation3D'
import GravityTractorPositioning from '../components/GravityTractorPositioning'

const DeflectionWizard = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [loading, setLoading] = useState(false)
  const [simulationResults, setSimulationResults] = useState(null)
  
  // Asteroid parameters
  const [asteroidParams, setAsteroidParams] = useState({
    name: '',
    internalStructure: 'rubble',
    differentiation: 'undifferentiated',
    composition: 'S-type',
    spinRate: 'normal',
    size: 370,
    closestDistance: 30000,
    speed: 20,
    density: 2.1,
    momentumFactor: 1.5
  })
  
  // Kinetic impactor parameters
  const [kineticParams, setKineticParams] = useState({
    impactorMass: 600,
    impactorVelocity: 15,
    impactLocation: 1.0
  })
  
  // Gravity tractor parameters
  const [gravityParams, setGravityParams] = useState({
    tractorMass: 20000,
    tractorDistance: 250
  })
  
  // NASA API common asteroids
  const commonAsteroids = {
    'apophis': '2099942',
    'bennu': '2101955',
    'didymos': '2065803',
    'ryugu': '3752273'
  }
  
  // Calculate warning time
  const calculateWarningTime = () => {
    const distance = asteroidParams.closestDistance
    const speed = asteroidParams.speed
    if (distance > 0 && speed > 0) {
      const timeInSeconds = distance / speed
      const timeInDays = timeInSeconds / (60 * 60 * 24)
      const timeInYears = timeInDays / 365.25
      return {
        years: timeInYears.toFixed(2),
        days: Math.round(timeInDays)
      }
    }
    return { years: 0, days: 0 }
  }
  
  // Search NASA API
  const searchNASA = async () => {
    const searchName = asteroidParams.name.trim().toLowerCase()
    if (!searchName) {
      toast.error('Please enter an asteroid name')
      return
    }
    
    setLoading(true)
    try {
      const commonId = commonAsteroids[searchName]
      let response
      
      if (commonId) {
        response = await fetch(
          `https://api.nasa.gov/neo/rest/v1/neo/${commonId}?api_key=dwxHg0wTUJPNlOTvc0nMsbVI1O9WVLJCmJhVT9IK`
        )
      } else {
        const browseResponse = await fetch(
          `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=dwxHg0wTUJPNlOTvc0nMsbVI1O9WVLJCmJhVT9IK`
        )
        
        if (!browseResponse.ok) throw new Error('NASA API request failed')
        
        const data = await browseResponse.json()
        const foundAsteroid = data.near_earth_objects.find(neo =>
          neo.name.toLowerCase().includes(searchName)
        )
        
        if (foundAsteroid) {
          response = await fetch(foundAsteroid.links.self.replace('http://', 'https://'))
        } else {
          throw new Error('Asteroid not found')
        }
      }
      
      if (!response.ok) throw new Error('Failed to fetch asteroid data')
      
      const details = await response.json()
      
      // Process and populate asteroid data
      const avgDiameter = Math.round(
        (details.estimated_diameter.meters.estimated_diameter_min +
          details.estimated_diameter.meters.estimated_diameter_max) / 2
      )
      
      let closestApproach = 30000
      let speed = 20
      
      if (details.close_approach_data && details.close_approach_data.length > 0) {
        const closest = details.close_approach_data.reduce((prev, curr) =>
          parseFloat(prev.miss_distance.kilometers) < parseFloat(curr.miss_distance.kilometers)
            ? prev
            : curr
        )
        closestApproach = Math.round(parseFloat(closest.miss_distance.kilometers))
        speed = parseFloat(closest.relative_velocity.kilometers_per_second)
      }
      
      setAsteroidParams(prev => ({
        ...prev,
        size: avgDiameter,
        closestDistance: closestApproach,
        speed: speed
      }))
      
      toast.success(`Loaded data for ${details.name}`)
      setTimeout(() => setCurrentStep(2), 1000)
      
    } catch (error) {
      console.error('NASA API Error:', error)
      if (error.message.includes('429')) {
        toast.error('NASA API rate limit exceeded. Please try again later or use custom scenario.')
      } else if (error.message.includes('not found')) {
        toast.error('Asteroid not found. Try another name or create a custom scenario.')
      } else {
        toast.error('Could not connect to NASA API. Please create a custom scenario.')
      }
    } finally {
      setLoading(false)
    }
  }
  
  // Run simulation
  const runSimulation = () => {
    setLoading(true)
    setCurrentStep(4)
    
    setTimeout(() => {
      const results = selectedMethod === 'kinetic'
        ? calculateKineticDeflection()
        : calculateGravityTractorDeflection()
      
      setSimulationResults(results)
      setLoading(false)
      toast.success('Simulation complete!')
    }, 1500)
  }
  
  // Calculate kinetic impactor deflection
  const calculateKineticDeflection = () => {
    const asteroidRadius = asteroidParams.size / 2
    const asteroidVolume = (4/3) * Math.PI * Math.pow(asteroidRadius, 3)
    const asteroidDensity = asteroidParams.density * 1000
    const asteroidMass = asteroidVolume * asteroidDensity
    
    const impactorMass = kineticParams.impactorMass
    const impactorVelocity = kineticParams.impactorVelocity * 1000
    const beta = asteroidParams.momentumFactor
    const locationMultiplier = asteroidParams.differentiation === 'differentiated'
      ? kineticParams.impactLocation
      : 1.0
    
    const momentumChange = beta * impactorMass * impactorVelocity
    const velocityChange = (momentumChange / asteroidMass) * locationMultiplier
    const asteroidSpeed_ms = asteroidParams.speed * 1000
    const deflectionAngle = Math.atan(velocityChange / asteroidSpeed_ms)
    
    const trajectoryWidth = 150
    const scale = 250
    const travelDistance = Math.sqrt(
      Math.pow(trajectoryWidth * scale, 2) +
      Math.pow(asteroidParams.closestDistance, 2)
    )
    const distanceChange = travelDistance * Math.tan(deflectionAngle)
    const newClosestDist = asteroidParams.closestDistance + distanceChange
    
    const earthRadius = 6371
    const success = newClosestDist > earthRadius
    
    return {
      method: 'kinetic',
      originalDistance: asteroidParams.closestDistance,
      newDistance: newClosestDist,
      success,
      asteroidMass,
      momentumChange,
      velocityChange,
      deflectionAngle: deflectionAngle * (180 / Math.PI),
      distanceChange,
      physics: {
        asteroidRadius,
        asteroidVolume,
        asteroidDensity,
        asteroidMass,
        impactorMass,
        impactorVelocity,
        beta,
        locationMultiplier,
        momentumChange,
        velocityChange
      }
    }
  }
  
  // Calculate gravity tractor deflection
  const calculateGravityTractorDeflection = () => {
    const G = 6.67430e-11
    const asteroidRadius = asteroidParams.size / 2
    const asteroidVolume = (4/3) * Math.PI * Math.pow(asteroidRadius, 3)
    const asteroidDensity = asteroidParams.density * 1000
    const asteroidMass = asteroidVolume * asteroidDensity
    
    const tractorMass = gravityParams.tractorMass
    const tractorDistance = gravityParams.tractorDistance
    const warningTime = calculateWarningTime()
    const tugTime = warningTime.days * 24 * 3600
    
    const force = G * (tractorMass * asteroidMass) / Math.pow(tractorDistance, 2)
    const acceleration = force / asteroidMass
    const distanceChange = 0.5 * acceleration * Math.pow(tugTime, 2) / 1000
    
    const newClosestDist = asteroidParams.closestDistance + distanceChange
    const earthRadius = 6371
    const success = newClosestDist > earthRadius
    
    return {
      method: 'gravity',
      originalDistance: asteroidParams.closestDistance,
      newDistance: newClosestDist,
      success,
      force,
      acceleration,
      tugTime,
      distanceChange,
      physics: {
        G,
        asteroidMass,
        tractorMass,
        tractorDistance,
        force,
        acceleration,
        tugTime,
        distanceChange: distanceChange * 1000
      }
    }
  }
  
  const warningTime = calculateWarningTime()
  
  return (
    <div className="min-h-screen bg-space-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-nasa font-bold text-white mb-4">
            Asteroid Deflection Simulator
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A comprehensive tool for simulating planetary defense methods
          </p>
        </div>
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            {[1, 2, 2.5, 3, 4].map((step, index) => (
              <React.Fragment key={step}>
                <div className={`flex flex-col items-center ${
                  currentStep >= step ? 'opacity-100' : 'opacity-40'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step
                      ? 'bg-nasa-blue text-white'
                      : 'bg-gray-600 text-gray-400'
                  }`}>
                    {step}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {step === 1 ? 'Identify' : step === 2 ? 'Parameters' : step === 2.5 ? 'Method' : step === 3 ? 'Plan' : 'Results'}
                  </span>
                </div>
                {index < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-nasa-blue' : 'bg-gray-600'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="card max-w-6xl mx-auto">
          {/* Step 1: Identify Threat */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Step 1: Identify the Threat
              </h2>
              <p className="text-gray-400 mb-6">
                Start by searching for a known Near-Earth Object (NEO) from the NASA database,
                or define a custom hypothetical asteroid scenario.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={asteroidParams.name}
                    onChange={(e) => setAsteroidParams(prev => ({ ...prev, name: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && searchNASA()}
                    placeholder="Enter Asteroid Name (e.g., Apophis, Bennu)"
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-nasa-blue"
                  />
                  <button
                    onClick={searchNASA}
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                    <span>Search NASA Database</span>
                  </button>
                </div>
                
                <div className="text-center text-gray-500">or</div>
                
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Create Custom Scenario
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Define Parameters */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Step 2: Define Asteroid Parameters
              </h2>
              <p className="text-gray-400 mb-6">
                Specify the physical characteristics of the asteroid. Data for known asteroids
                is populated automatically but can be adjusted.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Internal Structure
                  </label>
                  <select
                    value={asteroidParams.internalStructure}
                    onChange={(e) => setAsteroidParams(prev => ({ ...prev, internalStructure: e.target.value }))}
                    className="input-field"
                  >
                    <option value="rubble">Rubble Pile</option>
                    <option value="monolithic">Monolithic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Differentiation
                  </label>
                  <select
                    value={asteroidParams.differentiation}
                    onChange={(e) => setAsteroidParams(prev => ({ ...prev, differentiation: e.target.value }))}
                    className="input-field"
                  >
                    <option value="undifferentiated">Undifferentiated</option>
                    <option value="differentiated">Differentiated</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Composition
                  </label>
                  <select
                    value={asteroidParams.composition}
                    onChange={(e) => setAsteroidParams(prev => ({ ...prev, composition: e.target.value }))}
                    className="input-field"
                  >
                    <option value="S-type">S-type (Silicaceous)</option>
                    <option value="C-type">C-type (Carbonaceous)</option>
                    <option value="M-type">M-type (Metallic)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Spin Rate
                  </label>
                  <select
                    value={asteroidParams.spinRate}
                    onChange={(e) => setAsteroidParams(prev => ({ ...prev, spinRate: e.target.value }))}
                    className="input-field"
                  >
                    <option value="normal">Normal</option>
                    <option value="slow">Slow</option>
                    <option value="fast">Fast</option>
                    <option value="tumbler">Tumbler</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Avg. Diameter (meters)
                  </label>
                  <input
                    type="number"
                    value={asteroidParams.size}
                    onChange={(e) => setAsteroidParams(prev => ({ ...prev, size: parseFloat(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Closest Distance (km)
                  </label>
                  <input
                    type="number"
                    value={asteroidParams.closestDistance}
                    onChange={(e) => setAsteroidParams(prev => ({ ...prev, closestDistance: parseFloat(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Speed (km/s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={asteroidParams.speed}
                    onChange={(e) => setAsteroidParams(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Density (g/cm³)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={asteroidParams.density}
                    onChange={(e) => setAsteroidParams(prev => ({ ...prev, density: parseFloat(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Momentum Factor (β)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={asteroidParams.momentumFactor}
                    onChange={(e) => setAsteroidParams(prev => ({ ...prev, momentumFactor: parseFloat(e.target.value) }))}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setCurrentStep(2.5)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Next: Choose Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2.5: Choose Method */}
          {currentStep === 2.5 && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Step 2.5: Choose Deflection Method
              </h2>
              <p className="text-gray-400 mb-6">
                Select how you want to attempt to deflect the asteroid.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => {
                    setSelectedMethod('kinetic')
                    setCurrentStep(3)
                  }}
                  className="p-6 border-2 border-gray-600 hover:border-nasa-blue rounded-lg text-center transition-all transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Kinetic Impactor</h3>
                  <p className="text-gray-400">
                    Crash a high-speed spacecraft into the asteroid to alter its course. A direct, forceful approach.
                  </p>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedMethod('gravity')
                    setCurrentStep(3)
                  }}
                  className="p-6 border-2 border-gray-600 hover:border-nasa-blue rounded-lg text-center transition-all transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Gravity Tractor</h3>
                  <p className="text-gray-400">
                    Use the subtle but persistent gravitational pull of a nearby spacecraft to gently tug the asteroid off course over time.
                  </p>
                </button>
              </div>
              
              <div className="mt-8">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3a: Kinetic Impactor Planning */}
          {currentStep === 3 && selectedMethod === 'kinetic' && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Step 3a: Plan Kinetic Impactor Mission
              </h2>
              
              <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
                <p className="font-bold text-yellow-400 mb-1">Estimated Warning Time</p>
                <p className="text-yellow-200">
                  Approximately {warningTime.years} years ({warningTime.days} days)
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Impactor Mass (kg)
                  </label>
                  <input
                    type="number"
                    value={kineticParams.impactorMass}
                    onChange={(e) => setKineticParams(prev => ({ ...prev, impactorMass: parseFloat(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Impactor Velocity (km/s)
                  </label>
                  <input
                    type="number"
                    value={kineticParams.impactorVelocity}
                    onChange={(e) => setKineticParams(prev => ({ ...prev, impactorVelocity: parseFloat(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Impact Location
                  </label>
                  <select
                    value={kineticParams.impactLocation}
                    onChange={(e) => setKineticParams(prev => ({ ...prev, impactLocation: parseFloat(e.target.value) }))}
                    className="input-field"
                  >
                    <option value="1.0">Head-on (Maximum Deflection)</option>
                    <option value="0.7">Off-center (Balanced Push)</option>
                    <option value="0.3">Glancing Blow (Minimal Deflection)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    Impacting a differentiated asteroid off-center may be less effective if energy is absorbed by less dense crust.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2.5)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={runSimulation}
                  className="btn-primary bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Run Simulation</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3b: Gravity Tractor Planning */}
          {currentStep === 3 && selectedMethod === 'gravity' && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Step 3b: Plan Gravity Tractor Mission
              </h2>
              
              <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
                <p className="font-bold text-yellow-400 mb-1">Estimated Mission Duration</p>
                <p className="text-yellow-200">
                  Approximately {warningTime.years} years ({warningTime.days} days)
                </p>
              </div>
              
              <p className="text-gray-400 mb-6">
                Set the spacecraft mass and position using the interactive views below.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tractor Spacecraft Mass (kg)
                </label>
                <input
                  type="number"
                  value={gravityParams.tractorMass}
                  onChange={(e) => setGravityParams(prev => ({ ...prev, tractorMass: parseFloat(e.target.value) }))}
                  className="input-field max-w-md"
                />
              </div>
              
              <GravityTractorPositioning
                asteroidSize={asteroidParams.size}
                onDistanceChange={(distance) => setGravityParams(prev => ({ ...prev, tractorDistance: distance }))}
              />
              
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2.5)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={runSimulation}
                  className="btn-primary bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Run Simulation</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Step 4: Simulation Results */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Step 4: Simulation Results
              </h2>
              <p className="text-gray-400 mb-6">
                The visualization below shows the original and new trajectories. Pan, zoom, and rotate to explore.
              </p>
              
              {loading ? (
                <div className="h-[60vh] flex flex-col items-center justify-center">
                  <Loader2 className="w-16 h-16 text-nasa-blue animate-spin mb-4" />
                  <p className="text-white">Calculating trajectories...</p>
                </div>
              ) : simulationResults ? (
                <>
                  <DeflectionSimulation3D
                    method={selectedMethod}
                    results={simulationResults}
                    asteroidParams={asteroidParams}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                      <h3 className="font-bold text-gray-400 text-sm mb-2">MISSION STATUS</h3>
                      <p className={`text-2xl font-bold ${
                        simulationResults.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {simulationResults.success ? 'SUCCESS' : 'FAILURE'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                      <h3 className="font-bold text-gray-400 text-sm mb-2">ORIGINAL CLOSEST APPROACH</h3>
                      <p className="text-2xl font-bold text-white">
                        {Math.round(simulationResults.originalDistance).toLocaleString()} km
                      </p>
                    </div>
                    
                    <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                      <h3 className="font-bold text-gray-400 text-sm mb-2">NEW CLOSEST APPROACH</h3>
                      <p className="text-2xl font-bold text-white">
                        {Math.round(simulationResults.newDistance).toLocaleString()} km
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => {
                        setCurrentStep(1)
                        setSelectedMethod(null)
                        setSimulationResults(null)
                      }}
                      className="btn-primary"
                    >
                      Start New Simulation
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeflectionWizard
