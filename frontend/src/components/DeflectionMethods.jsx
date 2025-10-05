import React from 'react'
import { Target, Shield, Zap } from 'lucide-react'

const DeflectionMethods = ({ onMethodSelect }) => {
  const methods = [
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
    },
    {
      id: 'nuclear',
      name: 'Nuclear Deflection',
      description: 'Nuclear explosion near asteroid to alter its course',
      icon: Zap,
      color: 'from-red-500 to-red-600'
    }
  ]

  const handleMethodClick = (methodId) => {
    onMethodSelect(methodId)
    if (methodId === 'kinetic_impactor') {
      // Open the NEO Deflection App in a new window
      window.open('/NASA_JPL_NEO_Deflection_App/nda_frame.html', '_blank')
    }
  }

  return (
    <div className="grid gap-4 p-4">
      {methods.map((method) => {
        const Icon = method.icon
        return (
          <button
            key={method.id}
            onClick={() => handleMethodClick(method.id)}
            className="flex items-start space-x-4 p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className={`p-3 rounded-lg bg-gradient-to-r ${method.color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white mb-2">{method.name}</h3>
              <p className="text-gray-300">{method.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default DeflectionMethods