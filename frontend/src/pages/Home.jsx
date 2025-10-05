import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Globe, Shield, BarChart3, Play, Star, Users, Award } from 'lucide-react'
import { useSimulation } from '../context/SimulationContext'
import { asteroidService } from '../services/simulationService'

const Home = () => {
  const { setAsteroidList, setLoading, setError } = useSimulation()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadAsteroidData()
  }, [])

  const loadAsteroidData = async () => {
    try {
      setLoading(true)
      const [asteroidResponse, statsResponse] = await Promise.all([
        asteroidService.getAsteroidList('sample', 4),
        asteroidService.getAsteroidStats()
      ])
      
      setAsteroidList(asteroidResponse.asteroids)
      setStats(statsResponse.stats)
    } catch (error) {
      setError('Failed to load asteroid data')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: Zap,
      title: 'Impact Simulation',
      description: 'Simulate asteroid impacts with real physics calculations including energy release, crater formation, and environmental effects.',
      link: '/simulation',
      color: 'from-meteor-orange to-red-500'
    },
    {
      icon: BarChart3,
      title: '3D Visualization',
      description: 'Explore asteroid orbits and impact scenarios in immersive 3D space with interactive orbital mechanics.',
      link: '/visualization',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: Globe,
      title: 'Impact Mapping',
      description: 'Visualize impact locations on Earth with damage zones, population effects, and environmental analysis.',
      link: '/impact-map',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Shield,
      title: 'Deflection Analysis',
      description: 'Analyze mitigation strategies including kinetic impactors, gravity tractors, and nuclear deflection.',
      link: '/mitigation',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const impactScenarios = [
    {
      name: 'Tunguska Event',
      diameter: 60,
      energy: '10-15 Mt TNT',
      year: 1908,
      location: 'Siberia, Russia',
      description: 'Airburst that flattened 2,000 km² of forest'
    },
    {
      name: 'Chicxulub Impact',
      diameter: 10000,
      energy: '100 Tt TNT',
      year: '66 Ma',
      location: 'Yucatán Peninsula',
      description: 'Cretaceous-Paleogene extinction event'
    },
    {
      name: 'Chelyabinsk Meteor',
      diameter: 20,
      energy: '500 kt TNT',
      year: 2013,
      location: 'Chelyabinsk, Russia',
      description: 'Airburst with 1,500+ injuries'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-space-dark via-gray-900 to-space-dark">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-2 h-2 bg-meteor-orange rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute top-60 right-1/3 w-1 h-1 bg-red-400 rounded-full animate-pulse delay-3000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-nasa font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nasa-blue via-white to-nasa-red">
                Meteor Madness
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Interactive asteroid impact simulation and planetary defense analysis for NASA Space Apps Challenge 2025
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/simulation"
                className="inline-flex items-center px-8 py-4 bg-nasa-blue hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 group"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Simulation
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-nasa font-bold text-white mb-4">
              Explore Planetary Defense
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the science behind asteroid impacts and the technologies we're developing to protect Earth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="group block"
                >
                  <div className="card hover:scale-105 transition-transform duration-300 h-full">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center text-nasa-blue group-hover:text-blue-400 transition-colors duration-200">
                      <span className="text-sm font-medium">Explore</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      {stats && (
        <section className="py-20 bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-nasa font-bold text-white mb-4">
                Asteroid Database
              </h2>
              <p className="text-xl text-gray-300">
                Real data from NASA's Near Earth Object Program
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-nasa-blue mb-2">
                  {stats.total_count}
                </div>
                <div className="text-gray-400">Asteroids Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-meteor-orange mb-2">
                  {stats.hazardous_count}
                </div>
                <div className="text-gray-400">Potentially Hazardous</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {Math.round(stats.diameter_stats.avg)}m
                </div>
                <div className="text-gray-400">Average Diameter</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">
                  {Math.round(stats.velocity_stats.avg)} km/s
                </div>
                <div className="text-gray-400">Average Velocity</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Historical Impacts Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-nasa font-bold text-white mb-4">
              Historical Impact Events
            </h2>
            <p className="text-xl text-gray-300">
              Learn from past asteroid impacts to understand the threat and develop better defenses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {impactScenarios.map((scenario, index) => (
              <div key={index} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {scenario.name}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {scenario.year}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Diameter:</span>
                    <span className="text-white">{scenario.diameter}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Energy:</span>
                    <span className="text-white">{scenario.energy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white">{scenario.location}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  {scenario.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-nasa-blue to-nasa-red">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-nasa font-bold text-white mb-4">
            Ready to Defend Earth?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start exploring asteroid impacts and deflection strategies today. 
            The future of planetary defense starts with understanding the threat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/simulation"
              className="inline-flex items-center px-8 py-4 bg-white text-nasa-blue font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Simulation
            </Link>
            <Link
              to="/mitigation"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-nasa-blue transition-colors duration-200"
            >
              <Shield className="w-5 h-5 mr-2" />
              Explore Deflection
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
