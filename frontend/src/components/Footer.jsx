import React from 'react'
import { Github, ExternalLink, Zap } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900/90 backdrop-blur-sm border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-nasa-blue to-nasa-red rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-nasa font-bold text-white">
                Meteor Madness
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-md">
              Interactive asteroid impact simulation and deflection analysis for NASA Space Apps Challenge 2024. 
              Explore the science of planetary defense through immersive 3D visualization and real-time calculations.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/your-username/meteor-madness"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://spaceappschallenge.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/simulation" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Impact Simulation
                </a>
              </li>
              <li>
                <a href="/visualization" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  3D Visualization
                </a>
              </li>
              <li>
                <a href="/impact-map" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Impact Map
                </a>
              </li>
              <li>
                <a href="/mitigation" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Deflection Analysis
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://cneos.jpl.nasa.gov/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  NASA NEO Program
                </a>
              </li>
              <li>
                <a 
                  href="https://www.nasa.gov/planetarydefense" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Planetary Defense
                </a>
              </li>
              <li>
                <a 
                  href="https://spaceappschallenge.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Space Apps Challenge
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  About This Project
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Meteor Madness. Built for NASA Space Apps Challenge.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Powered by NASA APIs</span>
              <span>•</span>
              <span>React + Three.js</span>
              <span>•</span>
              <span>Flask Backend</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
