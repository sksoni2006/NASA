import React from 'react'
import { Github, ExternalLink, Users, Award, Zap, Globe, Shield, BarChart3 } from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: Zap,
      title: 'Real Physics',
      description: 'Accurate impact calculations using validated scientific models for energy release, crater formation, and environmental effects.'
    },
    {
      icon: Globe,
      title: 'NASA Data',
      description: 'Integration with NASA NEO API for real asteroid data and USGS environmental datasets for comprehensive analysis.'
    },
    {
      icon: BarChart3,
      title: '3D Visualization',
      description: 'Immersive 3D orbital mechanics and impact visualization using Three.js for enhanced understanding.'
    },
    {
      icon: Shield,
      title: 'Deflection Analysis',
      description: 'Comprehensive mitigation strategy analysis including kinetic impactors, gravity tractors, and nuclear deflection.'
    }
  ]

  const team = [
    {
      name: 'Development Team',
      role: 'Full-Stack Development',
      description: 'React, Three.js, Flask, Python'
    },
    {
      name: 'Science Team',
      role: 'Physics & Astronomy',
      description: 'Impact modeling, orbital mechanics'
    },
    {
      name: 'Design Team',
      role: 'UI/UX Design',
      description: 'User experience, data visualization'
    }
  ]

  const technologies = [
    { name: 'React', category: 'Frontend' },
    { name: 'Three.js', category: '3D Graphics' },
    { name: 'Leaflet', category: 'Mapping' },
    { name: 'Flask', category: 'Backend' },
    { name: 'Python', category: 'Scientific Computing' },
    { name: 'NASA APIs', category: 'Data Sources' },
    { name: 'USGS Data', category: 'Environmental Data' },
    { name: 'Tailwind CSS', category: 'Styling' }
  ]

  return (
    <div className="min-h-screen bg-space-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-nasa font-bold text-white mb-6">
            About Meteor Madness
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            An interactive asteroid impact simulation and planetary defense analysis platform 
            built for NASA Space Apps Challenge 2024. Explore the science of protecting Earth 
            from asteroid impacts through immersive visualization and real-time calculations.
          </p>
        </div>

        {/* Mission Statement */}
        <section className="mb-16">
          <div className="card">
            <div className="text-center">
              <h2 className="text-3xl font-nasa font-bold text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-300 max-w-4xl mx-auto">
                To make planetary defense accessible and understandable through interactive simulations, 
                real-time calculations, and immersive visualizations. We believe that understanding 
                the threat of asteroid impacts is the first step in developing effective defense strategies.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-nasa font-bold text-white mb-4">Key Features</h2>
            <p className="text-xl text-gray-300">
              Advanced simulation capabilities powered by real scientific data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="card text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-nasa-blue to-nasa-red rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-nasa font-bold text-white mb-4">Technology Stack</h2>
            <p className="text-xl text-gray-300">
              Built with modern web technologies and scientific computing libraries
            </p>
          </div>

          <div className="card">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {technologies.map((tech, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{tech.name}</h3>
                    <p className="text-sm text-gray-400">{tech.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-nasa font-bold text-white mb-4">Our Team</h2>
            <p className="text-xl text-gray-300">
              Multidisciplinary team of developers, scientists, and designers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                <p className="text-nasa-blue font-medium mb-2">{member.role}</p>
                <p className="text-gray-400 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* NASA Space Apps Challenge */}
        <section className="mb-16">
          <div className="card bg-gradient-to-r from-nasa-blue/20 to-nasa-red/20 border border-nasa-blue/30">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-nasa-blue to-nasa-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-nasa font-bold text-white mb-4">
                NASA Space Apps Challenge 2024
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-6">
                This project was developed for the NASA Space Apps Challenge, an international 
                hackathon that brings together coders, scientists, designers, storytellers, 
                makers, builders, and technologists to solve real-world problems on Earth and in space.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://spaceappschallenge.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-nasa-blue hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Space Apps Challenge
                </a>
                <a
                  href="https://github.com/your-username/meteor-madness"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  <Github className="w-5 h-5 mr-2" />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-nasa font-bold text-white mb-4">Data Sources</h2>
            <p className="text-xl text-gray-300">
              Powered by authoritative scientific data from leading organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">NASA Near Earth Object Program</h3>
              <p className="text-gray-400 mb-4">
                Real-time asteroid data including orbital elements, physical properties, 
                and close approach information for thousands of near-Earth objects.
              </p>
              <a
                href="https://cneos.jpl.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-nasa-blue hover:text-blue-400 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Visit NASA NEO Program
              </a>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">USGS Geological Survey</h3>
              <p className="text-gray-400 mb-4">
                Environmental and geological data including elevation, seismic zones, 
                and geological features for comprehensive impact analysis.
              </p>
              <a
                href="https://www.usgs.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-nasa-blue hover:text-blue-400 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Visit USGS
              </a>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mb-16">
          <div className="card bg-yellow-900/20 border border-yellow-500/30">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Important Disclaimer</h2>
              <p className="text-yellow-200 max-w-4xl mx-auto">
                This simulation is for educational and demonstration purposes only. The calculations 
                and models used are simplified versions of complex scientific processes. For actual 
                planetary defense planning and decision-making, consult with qualified experts and 
                use validated scientific models and data sources.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="text-center">
            <h2 className="text-3xl font-nasa font-bold text-white mb-4">Get Involved</h2>
            <p className="text-xl text-gray-300 mb-8">
              Interested in contributing to planetary defense research and development?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/your-username/meteor-madness"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                <Github className="w-5 h-5 mr-2" />
                Contribute on GitHub
              </a>
              <a
                href="https://spaceappschallenge.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-nasa-blue hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                <Award className="w-5 h-5 mr-2" />
                Join Space Apps
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
