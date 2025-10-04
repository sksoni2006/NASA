# Deflection Wizard Implementation Guide

## Overview

I've created the main `DeflectionWizard.jsx` page with all the logic from `kinetic impactor3.html` integrated. Now you need to create two supporting components and add navigation.

## Components Still Needed

### 1. DeflectionSimulation3D Component

**File**: `frontend/src/components/DeflectionSimulation3D.jsx`

This component renders the 3D trajectory visualization using React Three Fiber.

**Key Features:**
- Displays Earth and Asteroid in 3D space
- Shows original trajectory (dashed line)
- Shows new trajectory (solid green/red line based on success)
- Animates asteroid along path
- Flash effect at impact point (for kinetic)
- Tractor spacecraft following asteroid (for gravity)
- Starfield background
- Proper lighting and materials

**Props:**
```javascript
{
  method: 'kinetic' | 'gravity',
  results: {
    originalDistance, newDistance, success, ...
  },
  asteroidParams: { size, ... }
}
```

**Implementation Reference:**
- Lines 591-810 of `kinetic impactor3.html` (runKineticSimulation)
- Lines 811-928 of `kinetic impactor3.html` (runGravityTractorSimulation)
- Use React Three Fiber equivalents for:
  - `THREE.CatmullRomCurve3` for trajectory paths
  - `THREE.TubeGeometry` for trajectory tubes
  - `THREE.PointLight` for flash effect
  - `useFrame` hook for animation

### 2. GravityTractorPositioning Component

**File**: `frontend/src/components/GravityTractorPositioning.jsx`

This component provides 2D and 3D views for positioning the tractor spacecraft.

**Key Features:**
- Side-by-side 2D (top-down) and 3D views
- Drag controls in 3D view to position spacecraft
- Real-time distance calculation
- Displays "Hover Distance: X m" label
- Visual representation of asteroid and spacecraft

**Props:**
```javascript
{
  asteroidSize: number,  // in meters
  onDistanceChange: (distance: number) => void
}
```

**Implementation Reference:**
- Lines 454-557 of `kinetic impactor3.html` (initPositioningScenes)
- Use:
  - `OrbitControls` from `@react-three/drei`
  - `DragControls` from three.js addons (or custom drag implementation)
  - Side-by-side Canvas elements
  - Update parent component when distance changes

## Quick Implementation Templates

### DeflectionSimulation3D.jsx (Skeleton)

```jsx
import React, { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei'
import * as THREE from 'three'

const Starfield = () => {
  // Create 10,000 random stars
  const points = []
  for (let i = 0; i < 10000; i++) {
    points.push(new THREE.Vector3(
      (Math.random() - 0.5) * 3000,
      (Math.random() - 0.5) * 3000,
      (Math.random() - 0.5) * 3000
    ))
  }
  
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="white" size={0.7} />
    </points>
  )
}

const Earth = ({ position }) => {
  const ref = useRef()
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.001
  })
  
  return (
    <group position={position}>
      <Sphere ref={ref} args={[12.742, 64, 64]}>
        <meshPhongMaterial color="#1565c0" />
      </Sphere>
      <Text position={[0, 15, 0]} fontSize={0.5} color="white">
        Earth
      </Text>
    </group>
  )
}

const Asteroid = ({ position, size }) => {
  const ref = useRef()
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.002
      ref.current.rotation.x += 0.001
    }
  })
  
  return (
    <group position={position}>
      <Sphere ref={ref} args={[Math.max(size / 1000, 1), 20, 20]}>
        <meshPhongMaterial color="#aaaaaa" roughness={0.9} />
      </Sphere>
      <Text position={[0, 3, 0]} fontSize={0.4} color="white">
        Asteroid
      </Text>
    </group>
  )
}

const TrajectoryPath = ({ originalPath, newPath, success }) => {
  const originalPoints = originalPath.map(p => new THREE.Vector3(...p))
  const newPoints = newPath ? newPath.map(p => new THREE.Vector3(...p)) : []
  
  return (
    <>
      {/* Original path - dashed */}
      <Line
        points={originalPoints}
        color="#888888"
        lineWidth={2}
        dashed
        dashScale={2}
      />
      
      {/* New path - solid green or red */}
      {newPath && (
        <Line
          points={newPoints}
          color={success ? "#00ff00" : "#ff0000"}
          lineWidth={2}
        />
      )}
    </>
  )
}

const AnimatedAsteroid = ({ path, asteroidSize }) => {
  const [t, setT] = useState(0)
  const ref = useRef()
  
  useFrame(() => {
    if (ref.current && t < path.length - 1) {
      ref.current.position.copy(path[t])
      setT(t => t + 1)
    }
  })
  
  return <Asteroid ref={ref} position={path[0]} size={asteroidSize} />
}

const DeflectionSimulation3D = ({ method, results, asteroidParams }) => {
  // Generate trajectory paths based on results
  const generatePaths = () => {
    const closestDist = results.originalDistance
    const newClosestDist = results.newDistance
    const scale = 250
    const trajectoryWidth = 150
    
    const originalPath = []
    const newPath = []
    
    for (let i = 0; i <= 200; i++) {
      const x = -trajectoryWidth + i * (trajectoryWidth * 2 / 200)
      const z_orig = (closestDist / scale) * Math.sqrt(1 - (x * x) / (trajectoryWidth * trajectoryWidth)) || 0
      originalPath.push([x, 0, z_orig])
      
      const z_new = (newClosestDist / scale) * Math.sqrt(1 - (x * x) / (trajectoryWidth * trajectoryWidth)) || 0
      newPath.push([x, 0, z_new])
    }
    
    return { originalPath, newPath }
  }
  
  const { originalPath, newPath } = generatePaths()
  
  return (
    <div className="w-full h-[60vh] bg-black rounded-lg">
      <Canvas camera={{ position: [0, 150, 0.1], fov: 75 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[100, 100, 100]} intensity={1.2} />
          
          <Starfield />
          <Earth position={[0, 0, 0]} />
          
          <TrajectoryPath
            originalPath={originalPath}
            newPath={newPath}
            success={results.success}
          />
          
          <Asteroid position={originalPath[0]} size={asteroidParams.size} />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default DeflectionSimulation3D
```

### GravityTractorPositioning.jsx (Skeleton)

```jsx
import React, { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Cone, Circle, Text } from '@react-three/drei'
import * as THREE from 'three'

const Scene2D = ({ asteroidSize, tractorPosition, onDrag }) => {
  return (
    <div className="relative w-full h-64 bg-gray-900 rounded-lg">
      <Canvas
        camera={{ position: [0, 100, 0], fov: 75 }}
        orthographic
        className="w-full h-full"
      >
        <ambientLight intensity={1} />
        
        {/* Asteroid */}
        <Circle args={[10, 32]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#888888" />
        </Circle>
        
        {/* Spacecraft */}
        <Circle
          args={[1.5, 16]}
          position={[tractorPosition.x, 0, tractorPosition.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial color="#ffffff" />
        </Circle>
        
        {/* Earth direction indicator */}
        <Circle
          args={[4, 32]}
          position={[0, 0, 40]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial color="#4d96ff" />
        </Circle>
        
        <OrbitControls enableRotate={false} />
      </Canvas>
      
      <div className="absolute top-2 left-2 text-white text-xs font-mono bg-black/60 p-2 rounded">
        Hover Distance: {calculateDistance(tractorPosition, asteroidSize)}m
      </div>
    </div>
  )
}

const Scene3D = ({ asteroidSize, onPositionChange }) => {
  const [tractorPos, setTractorPos] = useState([20, 0, 0])
  
  const handleDrag = (event) => {
    // Implement drag logic
    const newPos = [event.object.position.x, 0, event.object.position.z]
    setTractorPos(newPos)
    onPositionChange(newPos)
  }
  
  return (
    <div className="w-full h-64 bg-gray-900 rounded-lg">
      <Canvas camera={{ position: [0, 25, 30], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} />
        
        {/* Asteroid */}
        <Sphere args={[10, 32, 32]}>
          <meshPhongMaterial color="#888888" />
        </Sphere>
        
        {/* Tractor spacecraft - draggable */}
        <Cone
          args={[2, 5, 8]}
          position={tractorPos}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshPhongMaterial color="#eeeeee" />
        </Cone>
        
        <OrbitControls />
      </Canvas>
    </div>
  )
}

const GravityTractorPositioning = ({ asteroidSize, onDistanceChange }) => {
  const [tractorPosition, setTractorPosition] = useState({ x: 20, y: 0, z: 0 })
  
  useEffect(() => {
    const distance = Math.sqrt(
      tractorPosition.x ** 2 + tractorPosition.z ** 2
    ) * (asteroidSize / 20) // Scale factor
    onDistanceChange(distance)
  }, [tractorPosition, asteroidSize, onDistanceChange])
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="font-semibold text-white text-center mb-2">
          2D Top-Down View
        </h3>
        <Scene2D
          asteroidSize={asteroidSize}
          tractorPosition={tractorPosition}
        />
      </div>
      
      <div>
        <h3 className="font-semibold text-white text-center mb-2">
          3D Interactive View
        </h3>
        <Scene3D
          asteroidSize={asteroidSize}
          onPositionChange={(pos) => setTractorPosition({ x: pos[0], y: 0, z: pos[2] })}
        />
      </div>
    </div>
  )
}

function calculateDistance(position, asteroidSize) {
  const dist = Math.sqrt(position.x ** 2 + position.z ** 2)
  return Math.round(dist * (asteroidSize / 20))
}

export default GravityTractorPositioning
```

## 3. Add Navigation

### Update App.jsx

Add the route:

```jsx
import DeflectionWizard from './pages/DeflectionWizard'

// In your routes:
<Route path="/deflection" element={<DeflectionWizard />} />
```

### Update Navbar.jsx

Add navigation link:

```jsx
<Link to="/deflection" className="nav-link">
  Deflection Simulator
</Link>
```

## 4. Add Input Field Styles

In your CSS (probably `index.css` or tailwind.config.js), ensure you have:

```css
.input-field {
  @apply w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white;
  @apply focus:outline-none focus:border-nasa-blue transition-colors;
}
```

## Testing Checklist

- [ ] Step 1: NASA API search works (try "Apophis" or "Bennu")
- [ ] Step 1: Custom scenario button advances to Step 2
- [ ] Step 2: All parameter inputs update correctly
- [ ] Step 2.5: Both method cards are clickable
- [ ] Step 3a (Kinetic): Parameters can be adjusted
- [ ] Step 3b (Gravity): Mass input and positioning work
- [ ] Step 4: Simulation calculates and displays results
- [ ] Step 4: 3D visualization shows trajectories
- [ ] Step 4: Success/failure status displays correctly
- [ ] Reset button returns to Step 1

## Key Physics Formulas Implemented

### Kinetic Impactor
```
Momentum Change (Δp) = β × Impactor Mass × Impactor Velocity
Velocity Change (Δv) = Δp / Asteroid Mass × Location Multiplier
Deflection Angle = arctan(Δv / Asteroid Speed)
Distance Change = Travel Distance × tan(Deflection Angle)
```

### Gravity Tractor
```
Force (F) = G × (Tractor Mass × Asteroid Mass) / Distance²
Acceleration (a) = F / Asteroid Mass
Deflection Distance = 0.5 × a × Time²
```

## Additional Features to Consider

1. **Physics Details Modal**: Show detailed calculations
2. **Export Results**: Download simulation data
3. **Comparison Mode**: Compare multiple methods side-by-side
4. **Historical Scenarios**: Pre-load famous asteroid encounters
5. **Real-time Updates**: Update visualization as parameters change

## Troubleshooting

**Issue**: 3D canvas not rendering
- Check Three.js and React Three Fiber are installed
- Ensure Canvas has explicit height/width
- Check browser console for WebGL errors

**Issue**: NASA API rate limited
- The API key in the code is a demo key
- Consider getting your own key from https://api.nasa.gov
- Implement caching for asteroid data

**Issue**: Trajectory calculations seem off
- Verify scale factors match between components
- Check unit conversions (meters vs km)
- Ensure coordinate systems are consistent

## Summary

You now have:
1. ✅ Complete DeflectionWizard page with all logic
2. ✅ NASA API integration
3. ✅ Physics calculations for both methods
4. ⚠️ Need to create DeflectionSimulation3D component
5. ⚠️ Need to create GravityTractorPositioning component
6. ⚠️ Need to add navigation

The heavy lifting (NASA API, physics, wizard flow) is done. The remaining components are mostly visual/interactive wrappers around Three.js scenes.
