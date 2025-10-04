import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Cone, Box, Cylinder, Line, Text, Trail, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Enhanced Asteroid with realistic texture
const Asteroid = ({ position, scale = 1, color = '#8B7355' }) => {
  const meshRef = useRef()
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(scale, 32, 32)
    const positions = geo.attributes.position
    // Add surface irregularities
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      )
      const noise = (Math.random() - 0.5) * 0.15
      vertex.setLength(vertex.length() + noise)
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }
    geo.computeVertexNormals()
    return geo
  }, [scale])
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
      meshRef.current.rotation.x += 0.001
    }
  })
  
  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshStandardMaterial 
        color={color} 
        roughness={0.95} 
        metalness={0.05}
        bumpScale={0.3}
      />
    </mesh>
  )
}

// Enhanced Earth with atmosphere
const Earth = ({ position }) => {
  const meshRef = useRef()
  const atmosphereRef = useRef()
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0005
    }
  })
  
  return (
    <group position={position}>
      {/* Earth */}
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <meshStandardMaterial 
          color="#2E5C8A" 
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>
      
      {/* Atmosphere glow */}
      <Sphere ref={atmosphereRef} args={[2.15, 32, 32]}>
        <meshBasicMaterial 
          color="#6BB6FF"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Cloud layer */}
      <Sphere args={[2.05, 32, 32]}>
        <meshStandardMaterial 
          color="#FFFFFF"
          transparent
          opacity={0.2}
          roughness={1}
        />
      </Sphere>
    </group>
  )
}

// Enhanced Kinetic Impactor with realistic physics
const KineticImpactor = ({ asteroidPosition, showImpact, onComplete }) => {
  const [impactorPosition, setImpactorPosition] = useState([-15, 0, 0])
  const [isImpacting, setIsImpacting] = useState(false)
  const [explosionScale, setExplosionScale] = useState(0)
  const impactorRef = useRef()
  const particlesRef = useRef([])
  
  useFrame((state, delta) => {
    if (!showImpact) return
    
    if (isImpacting) {
      // Expand explosion
      if (explosionScale < 3) {
        setExplosionScale(s => s + delta * 2)
      }
      return
    }
    
    // Realistic acceleration towards target
    setImpactorPosition((pos) => {
      const target = asteroidPosition
      const direction = [
        target[0] - pos[0],
        target[1] - pos[1],
        target[2] - pos[2]
      ]
      const distance = Math.sqrt(direction[0]**2 + direction[1]**2 + direction[2]**2)
      
      if (distance < 0.5) {
        setIsImpacting(true)
        if (onComplete) setTimeout(() => onComplete(), 1000)
        return pos
      }
      
      // Accelerating speed (realistic kinetic impactor)
      const speed = 0.15 * (1 + (15 - distance) / 15)
      return [
        pos[0] + direction[0] / distance * speed,
        pos[1] + direction[1] / distance * speed,
        pos[2] + direction[2] / distance * speed
      ]
    })
  })
  
  if (!showImpact) return null
  
  return (
    <>
      {!isImpacting && (
        <Trail
          width={0.8}
          length={12}
          color="#FFD700"
          attenuation={(t) => t * t * t}
        >
          <group position={impactorPosition}>
            {/* Main body */}
            <Cone 
              ref={impactorRef}
              args={[0.4, 1.2, 8]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <meshStandardMaterial 
                color="#E8E8E8" 
                emissive="#FFD700"
                emissiveIntensity={0.8}
                metalness={0.7}
                roughness={0.3}
              />
            </Cone>
            {/* Thruster glow */}
            <pointLight position={[-0.8, 0, 0]} color="#FFA500" intensity={2} distance={3} />
          </group>
        </Trail>
      )}
      
      {isImpacting && (
        <>
          {/* Multi-layer explosion */}
          <Sphere position={asteroidPosition} args={[explosionScale * 0.6, 32, 32]}>
            <meshBasicMaterial 
              color="#FFFFFF" 
              transparent 
              opacity={Math.max(0, 0.9 - explosionScale * 0.3)}
            />
          </Sphere>
          <Sphere position={asteroidPosition} args={[explosionScale * 0.8, 24, 24]}>
            <meshBasicMaterial 
              color="#FFA500" 
              transparent 
              opacity={Math.max(0, 0.7 - explosionScale * 0.2)}
            />
          </Sphere>
          <Sphere position={asteroidPosition} args={[explosionScale, 16, 16]}>
            <meshBasicMaterial 
              color="#FF4500" 
              transparent 
              opacity={Math.max(0, 0.5 - explosionScale * 0.15)}
            />
          </Sphere>
          {/* Explosion light */}
          <pointLight 
            position={asteroidPosition} 
            color="#FFA500" 
            intensity={10 - explosionScale * 3} 
            distance={20} 
          />
        </>
      )}
    </>
  )
}

// Enhanced Gravity Tractor visualization
const GravityTractor = ({ asteroidPosition, showTractor }) => {
  const [tractorPosition, setTractorPosition] = useState([-5, 2, 0])
  const tractorRef = useRef()
  const angle = useRef(0)
  const [pulsePhase, setPulsePhase] = useState(0)
  const [trail, setTrail] = useState([])
  
  useFrame((state, delta) => {
    if (!showTractor) return
    
    // Orbit around asteroid with smooth motion
    angle.current += 0.008
    const radius = 3.5
    const newPos = [
      asteroidPosition[0] + Math.cos(angle.current) * radius,
      asteroidPosition[1] + Math.sin(angle.current * 2) * 0.4,
      asteroidPosition[2] + Math.sin(angle.current) * radius
    ]
    setTractorPosition(newPos)
    
    // Rotate to face asteroid
    if (tractorRef.current) {
      tractorRef.current.lookAt(new THREE.Vector3(...asteroidPosition))
    }
    
    // Pulse animation for gravitational field
    setPulsePhase(p => (p + delta * 2) % (Math.PI * 2))
    
    // Add to trail
    if (Math.floor(state.clock.elapsedTime * 10) % 3 === 0) {
      setTrail(prev => {
        const newTrail = [...prev, { position: newPos, timestamp: state.clock.elapsedTime }]
        return newTrail.slice(-60)
      })
    }
  })
  
  if (!showTractor) return null
  
  return (
    <>
      <group ref={tractorRef} position={tractorPosition}>
        {/* Main spacecraft body */}
        <Box args={[1.2, 0.6, 2]}>
          <meshStandardMaterial 
            color="#e0e0e0" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#404040"
            emissiveIntensity={0.2}
          />
        </Box>
        
        {/* Command module */}
        <Sphere position={[0, 0.4, 0.5]} args={[0.35, 16, 16]}>
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.7} 
            roughness={0.3}
            emissive="#0088ff"
            emissiveIntensity={0.3}
          />
        </Sphere>
        
        {/* Large solar panels with structural detail */}
        <group position={[2, 0, 0]}>
          <Box args={[0.05, 2, 1.5]}>
            <meshStandardMaterial 
              color="#0a0a3a" 
              metalness={0.4} 
              emissive="#000088" 
              emissiveIntensity={0.4}
            />
          </Box>
          {/* Solar panel grid lines */}
          {[...Array(8)].map((_, i) => (
            <Box key={i} position={[0.03, -0.75 + i * 0.25, 0]} args={[0.02, 0.02, 1.4]}>
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
            </Box>
          ))}
        </group>
        <group position={[-2, 0, 0]}>
          <Box args={[0.05, 2, 1.5]}>
            <meshStandardMaterial 
              color="#0a0a3a" 
              metalness={0.4} 
              emissive="#000088" 
              emissiveIntensity={0.4}
            />
          </Box>
          {/* Solar panel grid lines */}
          {[...Array(8)].map((_, i) => (
            <Box key={`left-${i}`} position={[-0.03, -0.75 + i * 0.25, 0]} args={[0.02, 0.02, 1.4]}>
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
            </Box>
          ))}
        </group>
        
        {/* Ion thrusters with glow */}
        {[0.3, -0.3].map((xOffset, idx) => (
          <group key={idx} position={[xOffset, 0, -1.1]}>
            <Cylinder args={[0.2, 0.15, 0.4, 8]}>
              <meshStandardMaterial 
                color="#ff6600" 
                metalness={0.8}
                emissive="#ff4400" 
                emissiveIntensity={1.5}
              />
            </Cylinder>
            {/* Thruster plume */}
            <Cone position={[0, -0.4, 0]} args={[0.15, 0.6, 8]}>
              <meshBasicMaterial 
                color="#00ccff" 
                transparent 
                opacity={0.6}
              />
            </Cone>
            <pointLight position={[0, -0.5, 0]} color="#00ccff" intensity={1.5} distance={2} />
          </group>
        ))}
        
        {/* Communication dish */}
        <Cylinder position={[0, 0.3, -0.5]} rotation={[Math.PI / 4, 0, 0]} args={[0.3, 0.25, 0.1, 16]}>
          <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
        </Cylinder>
        
        {/* Gravitational field visualization - multi-layered */}
        <Sphere args={[1.5, 24, 24]} scale={[1.5, 1.5, 1.5]}>
          <meshBasicMaterial 
            color="#00ffff" 
            transparent 
            opacity={0.15 + Math.sin(pulsePhase) * 0.08}
            wireframe 
          />
        </Sphere>
        <Sphere args={[1.5, 20, 20]} scale={[1.8, 1.8, 1.8]}>
          <meshBasicMaterial 
            color="#00aaff" 
            transparent 
            opacity={0.1 + Math.sin(pulsePhase + 1) * 0.05}
            wireframe 
          />
        </Sphere>
        <Sphere args={[1.5, 16, 16]} scale={[2.2, 2.2, 2.2]}>
          <meshBasicMaterial 
            color="#0088ff" 
            transparent 
            opacity={0.06 + Math.sin(pulsePhase + 2) * 0.03}
            wireframe 
          />
        </Sphere>
        
        {/* Directional gravitational force lines */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const radius = 2.5
          return (
            <Cylinder
              key={i}
              position={[
                Math.cos(angle) * radius, 
                Math.sin(angle * 2) * 0.3, 
                Math.sin(angle) * radius
              ]}
              rotation={[Math.PI / 2, -angle, 0]}
              args={[0.02, 0.02, 2, 4]}
            >
              <meshBasicMaterial 
                color="#00ffff" 
                transparent 
                opacity={0.4 + Math.sin(pulsePhase + i * 0.5) * 0.2}
              />
            </Cylinder>
          )
        })}
      </group>
      
      {/* Enhanced trail with gradient opacity */}
      {trail.map((point, i) => {
        if (i === 0) return null
        const opacity = (i / trail.length) * 0.5
        const linePoints = [
          new THREE.Vector3(...trail[i - 1].position),
          new THREE.Vector3(...point.position)
        ]
        return (
          <Line
            key={i}
            points={linePoints}
            color="#00ffff"
            lineWidth={2}
            transparent
            opacity={opacity}
          />
        )
      })}
      
      {/* Gravitational tether visualization to asteroid */}
      <Line
        points={[
          new THREE.Vector3(...tractorPosition),
          new THREE.Vector3(...asteroidPosition)
        ]}
        color="#00ff88"
        lineWidth={1.5}
        transparent
        opacity={0.25 + Math.sin(pulsePhase) * 0.15}
        dashed
        dashScale={3}
        dashSize={0.3}
        gapSize={0.2}
      />
    </>
  )
}

// Enhanced Nuclear Deflection visualization
const NuclearDeflection = ({ asteroidPosition, showNuclear, onComplete }) => {
  const [detonated, setDetonated] = useState(false)
  const [explosionScale, setExplosionScale] = useState(0)
  const [shockwaveScale, setShockwaveScale] = useState(0)
  const warheadRef = useRef()
  const [warheadPosition, setWarheadPosition] = useState([-12, 3, 0])
  const [trail, setTrail] = useState([])
  
  useFrame((state) => {
    if (!showNuclear || detonated) {
      if (detonated && explosionScale < 4) {
        setExplosionScale((s) => s + 0.06)
        setShockwaveScale((s) => s + 0.12)
        if (explosionScale >= 3.8 && onComplete) {
          onComplete()
        }
      }
      return
    }
    
    // Move warhead towards detonation point
    const target = [asteroidPosition[0] - 2, asteroidPosition[1], asteroidPosition[2]]
    setWarheadPosition((pos) => {
      const direction = [
        target[0] - pos[0],
        target[1] - pos[1],
        target[2] - pos[2]
      ]
      const distance = Math.sqrt(direction[0]**2 + direction[1]**2 + direction[2]**2)
      
      if (distance < 0.3) {
        setDetonated(true)
        return pos
      }
      
      // Add to trail
      if (Math.floor(state.clock.elapsedTime * 20) % 2 === 0) {
        setTrail(prev => [...prev, [...pos]].slice(-40))
      }
      
      const speed = 0.12
      return [
        pos[0] + direction[0] / distance * speed,
        pos[1] + direction[1] / distance * speed,
        pos[2] + direction[2] / distance * speed
      ]
    })
  })
  
  if (!showNuclear) return null
  
  return (
    <>
      {!detonated && (
        <>
          {/* Nuclear warhead missile */}
          <Trail
            width={1.2}
            length={8}
            color="#FF6600"
            attenuation={(t) => t * t}
          >
            <group position={warheadPosition}>
              {/* Missile body */}
              <Cone 
                ref={warheadRef}
                args={[0.35, 1.8, 8]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <meshStandardMaterial 
                  color="#880000" 
                  emissive="#FF4500"
                  emissiveIntensity={0.8}
                  metalness={0.8}
                  roughness={0.2}
                />
              </Cone>
              {/* Warning stripes */}
              {[...Array(4)].map((_, i) => (
                <Box key={i} position={[-0.3 - i * 0.3, 0, 0]} args={[0.1, 0.4, 0.4]}>
                  <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={0.5} />
                </Box>
              ))}
              {/* Thruster flame */}
              <Cone position={[-1.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} args={[0.25, 0.8, 8]}>
                <meshBasicMaterial color="#FF8800" transparent opacity={0.8} />
              </Cone>
              <pointLight position={[-1.5, 0, 0]} color="#FF6600" intensity={3} distance={4} />
            </group>
          </Trail>
          
          {/* Exhaust trail particles */}
          {trail.map((pos, i) => {
            const opacity = (i / trail.length) * 0.6
            const scale = (i / trail.length) * 0.5 + 0.2
            return (
              <Sphere key={i} position={pos} args={[0.15 * scale, 8, 8]}>
                <meshBasicMaterial 
                  color="#FF8800" 
                  transparent 
                  opacity={opacity}
                />
              </Sphere>
            )
          })}
        </>
      )}
      
      {detonated && (
        <>
          {/* Core explosion - white hot */}
          <Sphere position={warheadPosition} args={[explosionScale * 0.5, 32, 32]}>
            <meshBasicMaterial 
              color="#FFFFFF" 
              transparent 
              opacity={Math.max(0, 1.0 - explosionScale * 0.25)}
            />
          </Sphere>
          
          {/* Inner fireball - yellow/orange */}
          <Sphere position={warheadPosition} args={[explosionScale * 0.8, 32, 32]}>
            <meshBasicMaterial 
              color="#FFDD00" 
              transparent 
              opacity={Math.max(0, 0.85 - explosionScale * 0.2)}
            />
          </Sphere>
          
          {/* Middle layer - orange/red */}
          <Sphere position={warheadPosition} args={[explosionScale * 1.2, 32, 32]}>
            <meshBasicMaterial 
              color="#FF6600" 
              transparent 
              opacity={Math.max(0, 0.7 - explosionScale * 0.15)}
            />
          </Sphere>
          
          {/* Outer layer - dark red */}
          <Sphere position={warheadPosition} args={[explosionScale * 1.5, 32, 32]}>
            <meshBasicMaterial 
              color="#CC0000" 
              transparent 
              opacity={Math.max(0, 0.5 - explosionScale * 0.12)}
            />
          </Sphere>
          
          {/* Shockwave ring */}
          <Sphere position={warheadPosition} args={[shockwaveScale, 32, 32]} scale={[1, 0.3, 1]}>
            <meshBasicMaterial 
              color="#88DDFF" 
              transparent 
              opacity={Math.max(0, 0.6 - shockwaveScale * 0.08)}
              wireframe
            />
          </Sphere>
          
          {/* Debris particles */}
          {[...Array(16)].map((_, i) => {
            const angle = (i / 16) * Math.PI * 2
            const spread = explosionScale * 0.8
            const height = (Math.sin(i * 0.7) - 0.5) * spread
            return (
              <Sphere 
                key={i} 
                position={[
                  warheadPosition[0] + Math.cos(angle) * spread,
                  warheadPosition[1] + height,
                  warheadPosition[2] + Math.sin(angle) * spread
                ]} 
                args={[0.1 + Math.random() * 0.15, 8, 8]}
              >
                <meshBasicMaterial 
                  color={i % 3 === 0 ? "#FFAA00" : "#FF6600"}
                  transparent 
                  opacity={Math.max(0, 0.8 - explosionScale * 0.2)}
                />
              </Sphere>
            )
          })}
          
          {/* Massive explosion light */}
          <pointLight 
            position={warheadPosition} 
            color="#FFAA00" 
            intensity={Math.max(0, 20 - explosionScale * 4)} 
            distance={30} 
          />
          
          {/* Secondary rim light for atmosphere effect */}
          <pointLight 
            position={[warheadPosition[0] + 2, warheadPosition[1], warheadPosition[2]]} 
            color="#FF4400" 
            intensity={Math.max(0, 8 - explosionScale * 2)} 
            distance={15} 
          />
        </>
      )}
    </>
  )
}

// Trajectory path
const TrajectoryPath = ({ originalPath, deflectedPath }) => {
  const originalPoints = originalPath.map(p => new THREE.Vector3(...p))
  const deflectedPoints = deflectedPath ? deflectedPath.map(p => new THREE.Vector3(...p)) : []
  
  return (
    <>
      <Line
        points={originalPoints}
        color="#FF6B6B"
        lineWidth={2}
        dashed
        dashScale={1}
      />
      {deflectedPath && (
        <Line
          points={deflectedPoints}
          color="#4CAF50"
          lineWidth={2}
        />
      )}
    </>
  )
}

// Starfield Background Component
const Starfield = () => {
  const starsRef = useRef()
  
  const stars = useMemo(() => {
    const positions = []
    for (let i = 0; i < 2000; i++) {
      const radius = 100 + Math.random() * 100
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      )
    }
    return new Float32Array(positions)
  }, [])
  
  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={stars.length / 3}
          array={stars}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation={true}
      />
    </points>
  )
}

// Animated Asteroid with deflection effect
const AnimatedAsteroid = ({ basePosition, deflection, method, impactOccurred }) => {
  const asteroidRef = useRef()
  const [currentPosition, setCurrentPosition] = useState(basePosition)
  const [deflectionProgress, setDeflectionProgress] = useState(0)
  
  useFrame((state, delta) => {
    if (!asteroidRef.current) return
    
    // Rotate asteroid
    asteroidRef.current.rotation.x += delta * 0.2
    asteroidRef.current.rotation.y += delta * 0.3
    
    // Apply deflection gradually after impact
    if (impactOccurred && deflection && deflectionProgress < 1) {
      setDeflectionProgress(p => Math.min(p + delta * 0.3, 1))
      
      const deflectedPos = [
        basePosition[0] + deflection[0] * deflectionProgress,
        basePosition[1] + deflection[1] * deflectionProgress,
        basePosition[2] + deflection[2] * deflectionProgress
      ]
      setCurrentPosition(deflectedPos)
    }
  })
  
  return (
    <group ref={asteroidRef} position={currentPosition}>
      <Asteroid position={[0, 0, 0]} scale={1.5} />
      
      {/* Deflection indicator */}
      {impactOccurred && deflectionProgress > 0 && (
        <>
          {/* Trajectory change arrow */}
          <Cone position={[deflection[0] * 0.5, deflection[1] * 0.5 + 2, deflection[2] * 0.5]} rotation={[Math.PI / 2, 0, 0]} args={[0.3, 1, 8]}>
            <meshBasicMaterial color="#00ff00" transparent opacity={0.7} />
          </Cone>
          {/* Deflection particles */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const radius = 2 + deflectionProgress * 0.5
            return (
              <Sphere
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  2 + Math.sin(angle * 2) * 0.5,
                  Math.sin(angle) * radius
                ]}
                args={[0.1, 8, 8]}
              >
                <meshBasicMaterial color="#00ff88" transparent opacity={0.6} />
              </Sphere>
            )
          })}
        </>
      )}
    </group>
  )
}

// Main 3D Scene Component
const MitigationScene = ({ method, showAnimation, deflectionData, onTimeUpdate, onDistanceUpdate }) => {
  const [impactComplete, setImpactComplete] = useState(false)
  const [asteroidPosition, setAsteroidPosition] = useState([0, 0, 0])
  const [time, setTime] = useState(0)
  
  // Calculate deflection vector if successful
  const deflectionVector = deflectionData?.deflection_successful 
    ? [0, 3, 2] // Deflection away from Earth
    : null
  
  useFrame((state, delta) => {
    if (showAnimation) {
      setTime(t => {
        const newTime = t + delta
        if (onTimeUpdate) onTimeUpdate(newTime)
        return newTime
      })
      
      // Calculate distance from asteroid to Earth
      const earthPos = [15, 0, 0]
      const distance = Math.sqrt(
        Math.pow(asteroidPosition[0] - earthPos[0], 2) +
        Math.pow(asteroidPosition[1] - earthPos[1], 2) +
        Math.pow(asteroidPosition[2] - earthPos[2], 2)
      ) * 250 // Scale to km
      if (onDistanceUpdate) onDistanceUpdate(distance)
    }
  })
  
  // Generate trajectory paths
  const originalPath = []
  const deflectedPath = []
  for (let i = 0; i < 20; i++) {
    originalPath.push([i * 0.5 - 5, 0, 0])
    if (deflectionData && i > 10) {
      deflectedPath.push([i * 0.5 - 5, (i - 10) * 0.2, 0])
    } else if (deflectionData) {
      deflectedPath.push([i * 0.5 - 5, 0, 0])
    }
  }
  
  return (
    <>
      {/* Starfield Background */}
      <Starfield />
      
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4488ff" />
      <spotLight position={[0, 15, 0]} angle={0.4} intensity={0.6} penumbra={0.5} />
      {/* Rim lighting for depth */}
      <pointLight position={[0, 0, -20]} intensity={0.3} color="#8899ff" />
      
      {/* Earth */}
      <Earth position={[15, 0, 0]} />
      
      {/* Animated Asteroid with deflection */}
      <AnimatedAsteroid 
        basePosition={asteroidPosition} 
        deflection={deflectionVector}
        method={method}
        impactOccurred={impactComplete}
      />
      
      {/* Trajectory paths */}
      {deflectionData && (
        <TrajectoryPath 
          originalPath={originalPath} 
          deflectedPath={deflectionData.deflection_successful ? deflectedPath : null} 
        />
      )}
      
      {/* Method-specific visualization */}
      {method === 'kinetic_impactor' && (
        <KineticImpactor 
          asteroidPosition={asteroidPosition} 
          showImpact={showAnimation}
          onComplete={() => setImpactComplete(true)}
        />
      )}
      
      {method === 'gravity_tractor' && (
        <GravityTractor 
          asteroidPosition={asteroidPosition} 
          showTractor={showAnimation}
        />
      )}
      
      {method === 'nuclear' && (
        <NuclearDeflection 
          asteroidPosition={asteroidPosition} 
          showNuclear={showAnimation}
          onComplete={() => setImpactComplete(true)}
        />
      )}
      
      {/* Labels */}
      <Text
        position={[15, 3, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Earth
      </Text>
      
      <Text
        position={[asteroidPosition[0], asteroidPosition[1] + 2.5, asteroidPosition[2]]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Asteroid
      </Text>
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={false}
        maxDistance={50}
        minDistance={5}
      />
    </>
  )
}

// HUD Display Component
const HUDDisplay = ({ method, time, distance, deflectionData }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }
  
  const velocity = distance > 0 ? (distance / (time || 1)) : 0
  
  return (
    <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg text-sm font-mono backdrop-blur-sm border border-cyan-500/30">
      <div className="space-y-2">
        <div className="text-green-400 font-bold text-lg mb-2 flex items-center gap-2">
          {method === 'kinetic_impactor' && (
            <>
              <span className="text-2xl">🎯</span>
              <span>KINETIC IMPACTOR</span>
            </>
          )}
          {method === 'gravity_tractor' && (
            <>
              <span className="text-2xl">🛰</span>
              <span>GRAVITY TRACTOR</span>
            </>
          )}
          {method === 'nuclear' && (
            <>
              <span className="text-2xl">💥</span>
              <span>NUCLEAR DEFLECTION</span>
            </>
          )}
        </div>
        <div className="border-t border-gray-600 pt-2 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Mission Time:</span>
            <span className="text-cyan-400 font-bold">{formatTime(time)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Distance:</span>
            <span className="text-cyan-400 font-bold">{distance.toFixed(0)} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Velocity:</span>
            <span className="text-purple-400 font-bold">{velocity.toFixed(1)} km/s</span>
          </div>
          {deflectionData && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status:</span>
                <span className={`font-bold text-lg ${deflectionData.success ? 'text-green-400' : 'text-red-400'}`}>
                  {deflectionData.success ? '✔ SUCCESS' : '✖ FAILURE'}
                </span>
              </div>
              {deflectionData.newDistance && (
                <div className="text-xs text-gray-400 mt-1 flex justify-between">
                  <span>Miss Distance:</span>
                  <span className="text-green-300">{deflectionData.newDistance.toFixed(0)} km</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main component export
const MitigationVisualization3D = ({ method = 'kinetic_impactor', deflectionData = null, animate = false }) => {
  const [simulationTime, setSimulationTime] = useState(0)
  const [asteroidDistance, setAsteroidDistance] = useState(0)
  
  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 5, 20], fov: 50 }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <MitigationScene 
            method={method} 
            showAnimation={animate}
            deflectionData={deflectionData}
            onTimeUpdate={setSimulationTime}
            onDistanceUpdate={setAsteroidDistance}
          />
        </Suspense>
      </Canvas>
      
      <HUDDisplay 
        method={method}
        time={simulationTime}
        distance={asteroidDistance}
        deflectionData={deflectionData}
      />
      
      <div className="absolute bottom-4 left-4 bg-black/60 text-white p-3 rounded-lg text-sm">
        <p className="font-semibold mb-1">Controls:</p>
        <p>• Left click + drag to rotate</p>
        <p>• Scroll to zoom</p>
        <p>• Right click + drag to pan</p>
      </div>
    </div>
  )
}

export default MitigationVisualization3D
