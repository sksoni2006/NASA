import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Zap, Globe, Shield, BarChart3, Info } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/', icon: Globe },
    { name: 'Simulation', href: '/simulation', icon: Zap },
    { name: '3D Visualization', href: '/visualization', icon: BarChart3 },
    { name: 'Impact Map', href: '/impact-map', icon: Globe },
    { name: 'Mitigation', href: '/mitigation', icon: Shield },
    { name: 'About', href: '/about', icon: Info },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-nasa-blue to-nasa-red rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-nasa font-bold text-white">
              Meteor Madness
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-nasa-blue text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900/95 backdrop-blur-sm">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-nasa-blue text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
