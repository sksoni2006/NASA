import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Sphere, Line, Text } from '@react-three/drei'
import * as THREE from 'three'

// Constants (SI units)
const G = 6.67430e-11
const AU = 1.495978707e11
const DAY_S = 86400

const MASSES = {
  sun: 1.98847e30,
  earth: 5.97219e24,
  asteroid: 0
}

// Kepler solver using Newton's method
function keplerSolve(e, M) {
  let Mnorm = ((M + Math.PI) % (2 * Math.PI)) - Math.PI
  let E = Math.abs(e) < 0.8 ? Mnorm : Math.PI
  const tol = 1e-14
  
  for (let k = 0; k < 200; k++) {
    const f = E - e * Math.sin(E) - Mnorm
    const fp = 1 - e * Math.cos(E)
    const dE = f / fp
    E = E - dE
    if (Math.abs(dE) < tol) break
  }
  return E
}

// Convert orbital elements to state vector
function elementsToState(elements, centerMass) {
  const a = elements.a * AU
  const e = elements.e
  const i = elements.i * Math.PI / 180
  const om = elements.om * Math.PI / 180
  const w = elements.w * Math.PI / 180
  const ma = elements.ma * Math.PI / 180
  
  const E = keplerSolve(e, ma)
  const r_mag = a * (1 - e * Math.cos(E))
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2))
  
  const r_pf = [r_mag * Math.cos(nu), r_mag * Math.sin(nu), 0]
  
  const mu = G * centerMass
  const p = a * (1 - e * e)
  const v_pf = [
    -Math.sqrt(mu / p) * Math.sin(nu),
    Math.sqrt(mu / p) * (e + Math.cos(nu)),
    0
  ]
  
  const Rz = (th) => [
    [Math.cos(th), -Math.sin(th), 0],
    [Math.sin(th), Math.cos(th), 0],
    [0, 0, 1]
  ]
  
  const Rx = (th) => [
    [1, 0, 0],
    [0, Math.cos(th), -Math.sin(th)],
    [0, Math.sin(th), Math.cos(th)]
  ]
  
  const matMul = (A, B) => A.map(row => 
    B[0].map((_, i) => row.reduce((sum, val, j) => sum + val * B[j][i], 0))
  )
  
  const rot = matMul(matMul(Rz(om), Rx(i)), Rz(w))
  
  const r_ecl = rot.map(row => row.reduce((sum, val, i) => sum + val * r_pf[i], 0))
  const v_ecl = rot.map(row => row.reduce((sum, val, i) => sum + val * v_pf[i], 0))
  
  return [...r_ecl, ...v_ecl]
}

// Calculate accelerations
function calculateAccelerations(positions, masses) {
  const N = positions.length
  const acc = Array(N).fill(null).map(() => [0, 0, 0])
  const eps = 1e3
  
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (i === j) continue
      const rvec = positions[j].map((v, k) => v - positions[i][k])
      const r2 = rvec.reduce((sum, v) => sum + v * v, 0) + eps * eps
      const r = Math.sqrt(r2)
      const factor = G * masses[j] / (r2 * r)
      acc[i] = acc[i].map((a, k) => a + factor * rvec[k])
    }
  }
  return acc
}

// Fetch asteroid data from JPL
async function fetchAsteroidData(name) {
  const url = `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${encodeURIComponent(name)}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch asteroid data')
  const data = await response.json()
  if (!data.orbit || !data.orbit.elements) throw new Error('No orbital data found')
  
  const elements = {}
  data.orbit.elements.forEach(el => {
    elements[el.name] = parseFloat(el.value)
  })
  
  return {
    name: data.object.fullname,
    elements
  }
}

// Animated body component
function AnimatedBody({ path, color, size, label }) {
  const meshRef = useRef()
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useFrame((state) => {
    if (path && path.length > 0) {
      const speed = 0.5
      const newIndex = Math.floor((state.clock.elapsedTime * speed) % path.length)
      setCurrentIndex(newIndex)
      
      if (meshRef.current && path[newIndex]) {
        meshRef.current.position.set(...path[newIndex])
      }
    }
  })
  
  if (!path || path.length === 0) return null
  
  return (
    <group>
      <Sphere ref={meshRef} args={[size, 32, 32]} position={path[0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </Sphere>
      {label && (
        <Text position={[path[currentIndex][0], path[currentIndex][1] + size * 1.5, path[currentIndex][2]]} fontSize={0.15} color="white">
          {label}
        </Text>
      )}
    </group>
  )
}

// Main scene
function Scene({ earthPath, asteroidPath, asteroidName }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
      
      <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
      
      {/* Sun */}
      <Sphere args={[0.15, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#FDB813" emissive="#FDB813" emissiveIntensity={1} />
      </Sphere>
      
      {/* Orbit paths */}
      {earthPath && earthPath.length > 0 && (
        <Line points={earthPath} color="#00BFFF" lineWidth={1} />
      )}
      {asteroidPath && asteroidPath.length > 0 && (
        <Line points={asteroidPath} color="#FF6347" lineWidth={1} />
      )}
      
      {/* Animated bodies */}
      <AnimatedBody path={earthPath} color="#1E90FF" size={0.08} label="Earth" />
      <AnimatedBody path={asteroidPath} color="#FF4500" size={0.05} label={asteroidName} />
      
      {/* Grid helper */}
      <gridHelper args={[10, 20, '#444444', '#222222']} rotation={[Math.PI / 2, 0, 0]} />
    </>
  )
}

// Main component
export default function AsteroidOrbitalSimulation() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [asteroidList, setAsteroidList] = useState([])
  const [selectedAsteroid, setSelectedAsteroid] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(false)
  const [error, setError] = useState(null)
  const [dateError, setDateError] = useState(null)
  
  const [earthPath, setEarthPath] = useState([])
  const [asteroidPath, setAsteroidPath] = useState([])
  const [simulationData, setSimulationData] = useState(null)
  
  // Calculate days difference
  const getDaysDifference = (start, end) => {
    const startD = new Date(start)
    const endD = new Date(end)
    const diffTime = Math.abs(endD - startD)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  
  // Validate date range
  const validateDates = () => {
    setDateError(null)
    
    if (!startDate || !endDate) {
      setDateError('Please select both start and end dates')
      return false
    }
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start > end) {
      setDateError('Start date must be before end date')
      return false
    }
    
    const daysDiff = getDaysDifference(startDate, endDate)
    if (daysDiff > 7) {
      setDateError('Date range must be 7 days or less')
      return false
    }
    
    return true
  }
  
  // Fetch asteroid list from NASA NeoWs API
  const fetchAsteroidList = async () => {
    if (!validateDates()) return
    
    setLoadingList(true)
    setError(null)
    setAsteroidList([])
    setSelectedAsteroid(null)
    
    try {
      const API_KEY = 'wxHg0wTUJPNlOTvc0nMsbVI1O9WVLJCmJhVT9IK'
      const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=dwxHg0wTUJPNlOTvc0nMsbVI1O9WVLJCmJhVT9IK`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch asteroid list from NASA API')
      
      const data = await response.json()
      const asteroids = []
      
      // Extract all asteroids from near_earth_objects
      Object.keys(data.near_earth_objects).forEach(date => {
        data.near_earth_objects[date].forEach(neo => {
          asteroids.push({
            id: neo.id,
            name: neo.name,
            neo_reference_id: neo.neo_reference_id,
            isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
            estimatedDiameter: neo.estimated_diameter?.meters?.estimated_diameter_max || 0,
            closeApproachData: neo.close_approach_data?.[0] || null,
            absoluteMagnitude: neo.absolute_magnitude_h
          })
        })
      })
      
      // Remove duplicates by id
      const uniqueAsteroids = Array.from(
        new Map(asteroids.map(a => [a.id, a])).values()
      ).sort((a, b) => a.name.localeCompare(b.name))
      
      setAsteroidList(uniqueAsteroids)
      
      if (uniqueAsteroids.length === 0) {
        setError('No asteroids found in this date range')
      } else if (uniqueAsteroids.length > 0) {
        setSelectedAsteroid(uniqueAsteroids[0])
      }
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingList(false)
    }
  }
  
  // Run orbital simulation
  const runSimulation = async () => {
    if (!selectedAsteroid) {
      setError('Please select an asteroid first')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Extract asteroid name/designation for JPL query
      const asteroidName = selectedAsteroid.name.replace(/[()]/g, '').trim()
      const astData = await fetchAsteroidData(asteroidName)
      
      // Earth orbital elements
      const earthElements = {
        e: 0.01671022,
        a: 1.00000011,
        i: 0.00005,
        om: -11.26064,
        w: 114.20783,
        ma: 100.46435
      }
      
      const astState = elementsToState(astData.elements, MASSES.sun)
      const earthState = elementsToState(earthElements, MASSES.sun)
      const sunState = [0, 0, 0, 0, 0, 0]
      
      let positions = [
        sunState.slice(0, 3),
        earthState.slice(0, 3),
        astState.slice(0, 3)
      ]
      
      let velocities = [
        sunState.slice(3, 6),
        earthState.slice(3, 6),
        astState.slice(3, 6)
      ]
      
      const bodyMasses = [MASSES.sun, MASSES.earth, MASSES.asteroid]
      
      const totalDays = 730
      const timeStepDays = 0.5
      const dt = timeStepDays * DAY_S
      const numSteps = Math.floor(totalDays / timeStepDays)
      
      const earthTraj = []
      const astTraj = []
      
      let acc = calculateAccelerations(positions, bodyMasses)
      
      for (let step = 0; step < numSteps; step++) {
        positions = positions.map((pos, i) => 
          pos.map((p, j) => p + velocities[i][j] * dt + 0.5 * acc[i][j] * dt * dt)
        )
        
        const newAcc = calculateAccelerations(positions, bodyMasses)
        
        velocities = velocities.map((vel, i) => 
          vel.map((v, j) => v + 0.5 * (acc[i][j] + newAcc[i][j]) * dt)
        )
        
        acc = newAcc
        
        if (step % 5 === 0) {
          earthTraj.push(positions[1].map(v => v / AU))
          astTraj.push(positions[2].map(v => v / AU))
        }
      }
      
      setEarthPath(earthTraj)
      setAsteroidPath(astTraj)
      setSimulationData({
        name: astData.name,
        elements: astData.elements,
        duration: totalDays,
        asteroidData: selectedAsteroid
      })
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // Set default dates (today and 7 days ago)
  useEffect(() => {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    setEndDate(today.toISOString().split('T')[0])
    setStartDate(weekAgo.toISOString().split('T')[0])
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            N-Body Orbital Simulation
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real asteroid orbits from JPL database with gravitational perturbations
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl h-[700px]">
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-white text-xl">Loading 3D Scene...</div>
                </div>
              }>
                <Canvas camera={{ position: [5, 3, 5], fov: 60 }}>
                  <Scene 
                    earthPath={earthPath} 
                    asteroidPath={asteroidPath}
                    asteroidName={simulationData?.name || 'Asteroid'}
                  />
                  <OrbitControls 
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={1}
                    maxDistance={15}
                  />
                </Canvas>
              </Suspense>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Simulation Control */}
           <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
  <h2 className="text-2xl font-bold text-white mb-4">Simulation Control</h2>

  <div className="space-y-4">
    {/* Date Inputs */}
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Start Date
      </label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => {
          setStartDate(e.target.value)
          setDateError(null)
        }}
        className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        End Date (max 7 days)
      </label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => {
          setEndDate(e.target.value)
          setDateError(null)
        }}
        className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
      />
    </div>

    {dateError && (
      <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-200 px-3 py-2 rounded text-sm">
        {dateError}
      </div>
    )}

    {startDate && endDate && !dateError && (
      <div className="text-sm text-gray-400">
        Range: {getDaysDifference(startDate, endDate)} day(s)
      </div>
    )}

    <button
      onClick={fetchAsteroidList}
      disabled={loadingList || !startDate || !endDate}
      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
    >
      {loadingList ? 'Loading Asteroids...' : 'Fetch Asteroids'}
    </button>

    {/* Divider */}
    <div className="border-t border-gray-700 my-4" />

    {/* OR direct input */}
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        🔍 Direct Asteroid Name
      </label>
      <input
        type="text"
        placeholder="e.g. Apophis, 433 Eros, Bennu"
        onChange={(e) => {
          const name = e.target.value.trim()
          if (name.length > 0) {
            setSelectedAsteroid({ id: 'manual', name })
          } else {
            setSelectedAsteroid(null)
          }
        }}
        className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
      />
      <p className="text-xs text-gray-400 mt-1">
        Type asteroid name if you already know it (JPL lookup)
      </p>
    </div>

    {/* Asteroid Dropdown */}
    {asteroidList.length > 0 && (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Asteroid Name ({asteroidList.length} found)
        </label>
        <select
          value={selectedAsteroid?.id || ''}
          onChange={(e) => {
            const asteroid = asteroidList.find(a => a.id === e.target.value)
            setSelectedAsteroid(asteroid)
          }}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          {asteroidList.map((ast) => (
            <option key={ast.id} value={ast.id}>
              {ast.name} {ast.isPotentiallyHazardous ? '⚠️' : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">⚠️ = Potentially Hazardous</p>
      </div>
    )}

    <button
      onClick={runSimulation}
      disabled={loading || !selectedAsteroid}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded transition-colors"
    >
      {loading ? 'Simulating...' : 'Run Simulation'}
    </button>

    {error && (
      <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 py-2 rounded text-sm">
        {error}
      </div>
    )}
  </div>
</div>

            
            {/* Orbital Data */}
            {simulationData && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4">Orbital Data</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Object:</div>
                    <div className="text-white font-medium">{simulationData.name}</div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Semi-major axis:</span>
                    <span className="text-white">{simulationData.elements.a?.toFixed(4)} AU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Eccentricity:</span>
                    <span className="text-white">{simulationData.elements.e?.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Inclination:</span>
                    <span className="text-white">{simulationData.elements.i?.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{simulationData.duration} days</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Examples */}
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-6">
              <h4 className="text-blue-300 font-semibold mb-3">Quick Examples</h4>
              <div className="space-y-2 text-sm text-blue-200">
                <p>• Select dates within 7 days</p>
                <p>• Click "Fetch Asteroids"</p>
                <p>• Choose from dropdown</p>
                <p>• Run simulation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}