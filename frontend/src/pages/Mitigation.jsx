import React, { useState, useRef } from 'react'
import { Shield, Zap, Target, Globe } from 'lucide-react'  // Add Globe to imports

// Add this rotating Earth component at the top of your file
const RotatingEarth = () => {
  const earthRef = useRef()

  React.useEffect(() => {
    const rotate = () => {
      if (earthRef.current) {
        earthRef.current.style.transform = `rotate(${Date.now() / 100 % 360}deg)`
      }
      requestAnimationFrame(rotate)
    }
    const animation = requestAnimationFrame(rotate)
    return () => cancelAnimationFrame(animation)
  }, [])

  return (
    <div ref={earthRef} className="inline-block">
      <Globe className="w-6 h-6 text-blue-400" />
    </div>
  )
}

const Mitigation = () => {
  const [selectedMethod, setSelectedMethod] = useState(null)

  const openNeoDeflectionApp = (buttonId) => {
    switch (buttonId) {
      case 'BPlane_Simulation':
        window.open('/NASA_JPL_NEO_Deflection_App/Bplane.html', '_blank')
        break;
      case 'Orbit_Simulation':
        // Replace this URL with your actual GitHub repository URL
        window.open('https://github.com/SohamDeep2026/NASA-SpaceApps---Meteor-Madness---Pagal-Ulkapind/tree/main/Kinetic_Impactor_Orbit_Simulator/New%20folder', '_blank')
        break;
      case 'Kinetic_Impactor':
        window.open('/NASA_JPL_NEO_Deflection_App/nda_frame.html', '_blank')
        break;
      case 'gravity_tractor':
        window.open('/NASA_JPL_NEO_Deflection_App/gravity tractor3.html', '_blank')
        break;
      default:
        console.error('Unknown button:', buttonId)
    }
  }

  const handleMethodClick = (methodId) => {
    setSelectedMethod(methodId === selectedMethod ? null : methodId)
  }

  const deflectionMethods = [
    {
      id: 'kinetic_impactor',
      name: 'Kinetic Impactor',
      description: 'A high-speed spacecraft purposely strikes the asteroid to deliver a calculated impulse. The goal isn’t destruction but a small nudge that changes its speed enough that, over time, the rock misses Earth. Accurate targeting is key to this defense strategy.',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      image: '/Assets/K.jpeg' // Add image to public/images folder
    },
    {
      id: 'gravity_tractor',
      name: 'Gravity Tractor',
      description: 'The Gravity Traction method uses a spacecraft gravity to gently pull an asteroid off course. It a slow but steady approach that prevents breaking the asteroid into dangerous pieces. Early detection is key to this defense strategy.',
      icon: Shield,
      color: 'from-green-500 to-green-600',
      image: '/Assets/G.jpeg' // Add image to public/images folder
    }
  ]

  return (
    <div className="min-h-screen bg-space-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-nasa font-bold text-white mb-4">
            Deflection Methods
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {deflectionMethods.map((method) => {
            const Icon = method.icon
            const isSelected = selectedMethod === method.id
            return (
              <div key={method.id} className="flex flex-col">
                {/* Image Section */}
                <div className="relative h-90 mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={method.image}
                    alt={method.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Description Box with Icon and Name */}
                <div className="bg-gray-700/50 rounded-lg p-6 border-2 border-gray-600 flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${method.color} 
                                   rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{method.name}</h3>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{method.description}</p>
                  <button
                    onClick={() => method.id === 'gravity_tractor' ? 
                      openNeoDeflectionApp('gravity_tractor') : 
                      handleMethodClick(method.id)
                    }
                    className={`w-full p-3 rounded-lg ${
                      isSelected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-500'
                    } text-white transition-colors flex items-center justify-center space-x-2`}
                  >
                    {method.id === 'gravity_tractor' ? (
                      <>
                        <span>Simulation</span>
                        <RotatingEarth />
                      </>
                    ) : (
                      'Show More'
                    )}
                  </button>

                  {/* Sub-buttons for Kinetic Impactor */}
                  {isSelected && method.id === 'kinetic_impactor' && (
                    <div className="mt-4 space-y-2">
                      {[
                        { id: 'BPlane_Simulation', text: 'BPlane Simulation' },
                        { id: 'Orbit_Simulation', text: 'Orbit Simulation' },
                        { id: 'Kinetic_Impactor', text: 'Kinetic Impactor' }
                      ].map((button) => (
                        <button
                          key={button.id}
                          onClick={() => openNeoDeflectionApp(button.id)}
                          className="w-full p-3 rounded-lg bg-blue-600/70 hover:bg-blue-700 
                                   text-white transition-colors text-left"
                        >
                          {button.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Mitigation