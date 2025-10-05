import React from 'react'
import { Shield, Zap, Target } from 'lucide-react'

const Mitigation = () => {
  const openNeoDeflectionApp = (method) => {
    switch (method) {
      case 'kinetic_impactor':
        window.open('/NASA_JPL_NEO_Deflection_App/nda_frame.html', '_blank')
        break;
      case 'gravity_tractor':
        window.open('/NASA_JPL_NEO_Deflection_App/gravity tractor3.html', '_blank')
        break;

      default:
        console.error('Unknown deflection method:', method)
    }
  }

  const deflectionMethods = [
    {
      id: 'kinetic_impactor',
      name: 'Kinetic Impactor',
      description: 'High-speed spacecraft collision to change asteroid trajectory',
      icon: Target,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'gravity_tractor',
      name: 'Gravity Tractor',
      description: 'Spacecraft hovers near asteroid using gravitational attraction',
      icon: Shield,
      color: 'from-green-500 to-green-600'
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

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {deflectionMethods.map((method) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  onClick={() => openNeoDeflectionApp(method.id)}
                  className="w-full p-6 rounded-lg border-2 border-gray-600 bg-gray-700/50 
                           hover:border-gray-500 hover:bg-gray-600/50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${method.color} 
                                   rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white">{method.name}</h3>
                      <p className="text-gray-300">{method.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mitigation