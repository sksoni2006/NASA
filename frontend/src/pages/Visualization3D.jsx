import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Sphere, Text } from '@react-three/drei'
import { useSimulation } from '../context/SimulationContext'

// 3D Components
function Earth() {
  return (
    <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#1E40AF" />
    </Sphere>
  )
}

function Asteroid({ position, size = 0.1 }) {
  return (
    <Sphere args={[size, 16, 16]} position={position}>
      <meshStandardMaterial color="#FF6B35" />
    </Sphere>
  )
}

function OrbitPath({ radius = 2, segments = 64 }) {
  const points = []
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    points.push([
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ])
  }
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flat())}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#FF6B35" />
    </line>
  )
}

function Scene() {
  const { simulationParams, impactMetrics } = useSimulation()
  
  // Calculate asteroid position based on simulation parameters
  const asteroidSize = Math.min(0.2, Math.max(0.05, simulationParams.diameter_m / 1000))
  const orbitRadius = 3
  const asteroidPosition = [orbitRadius, 0, 0]

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      
      <Earth />
      
      <OrbitPath radius={orbitRadius} />
      
      <Asteroid position={asteroidPosition} size={asteroidSize} />
      
      {impactMetrics && (
        <Text
          position={[0, -2, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Impact Energy: {impactMetrics.energy_tnt_tons.toExponential(2)} tons TNT
        </Text>
      )}
    </>
  )
}

const Visualization3D = () => {
  const { simulationParams, impactMetrics } = useSimulation()

  return (
    <div className="min-h-screen bg-space-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-nasa font-bold text-white mb-4">
            3D Asteroid Visualization
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore asteroid orbits and impact scenarios in immersive 3D space with interactive orbital mechanics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 3D Canvas */}
          <div className="lg:col-span-3">
            <div className="card h-[600px] p-0 overflow-hidden">
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="loading-spinner"></div>
                </div>
              }>
                <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
                  <Scene />
                  <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={2}
                    maxDistance={20}
                  />
                </Canvas>
              </Suspense>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-2xl font-semibold text-white mb-6">Visualization Controls</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Current Parameters</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Diameter:</span>
                      <span className="text-white">{simulationParams.diameter_m}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Velocity:</span>
                      <span className="text-white">{simulationParams.velocity_km_s} km/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Density:</span>
                      <span className="text-white">{simulationParams.density_kg_m3} kg/m³</span>
                    </div>
                  </div>
                </div>

                {impactMetrics && (
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Impact Analysis</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Energy:</span>
                        <span className="text-white">{impactMetrics.energy_tnt_tons.toExponential(2)} tons TNT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Crater:</span>
                        <span className="text-white">{impactMetrics.crater_diameter_km.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Level:</span>
                        <span className="text-white capitalize">{impactMetrics.risk_level}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">Controls</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Left click + drag: Rotate view</li>
                    <li>• Right click + drag: Pan view</li>
                    <li>• Scroll: Zoom in/out</li>
                    <li>• Middle click: Reset view</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Visualization3D
