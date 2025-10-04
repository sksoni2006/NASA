import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import Simulation from './pages/Simulation'
import Visualization3D from './pages/Visualization3D'
import ImpactMap from './pages/ImpactMap'
import Mitigation from './pages/Mitigation'
import About from './pages/About'

// Context
import { SimulationProvider } from './context/SimulationContext'

function App() {
  return (
    <SimulationProvider>
      <div className="min-h-screen bg-space-gradient flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/visualization" element={<Visualization3D />} />
            <Route path="/impact-map" element={<ImpactMap />} />
            <Route path="/mitigation" element={<Mitigation />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        
        <Footer />
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#374151',
              color: '#FFFFFF',
              border: '1px solid #4B5563',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </div>
    </SimulationProvider>
  )
}

export default App
