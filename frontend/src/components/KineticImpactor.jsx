// src/components/KineticImpactor.jsx

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// A reusable component for inputs with arrow controls
const ControlledInput = ({ label, value, setValue, unit }) => {
  return (
    <div className="flex items-center justify-between space-x-2">
      <label className="text-gray-300 w-48">{label}:</label>
      <div className="flex items-center bg-gray-900 border border-gray-600 rounded-md p-1">
        <button className="p-1 hover:bg-gray-700 rounded">
          <ChevronLeft size={16} />
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 bg-transparent text-white text-center focus:outline-none"
        />
        <button className="p-1 hover:bg-gray-700 rounded">
          <ChevronRight size={16} />
        </button>
        {unit && <span className="text-gray-400 pl-2">{unit}</span>}
      </div>
    </div>
  );
};

const KineticImpactor = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('deltaV');

  // State for all inputs
  const [deflectionTime, setDeflectionTime] = useState(1096);
  const [deltaVA, setDeltaVA] = useState(0);
  const [deltaVC, setDeltaVC] = useState(0);
  const [deltaVN, setDeltaVN] = useState(0);
  const [selectedObject, setSelectedObject] = useState('pdc25');
  const [diameter, setDiameter] = useState('');
  const [density, setDensity] = useState('3.0');
  const [beta, setBeta] = useState('1');

  return (
    <div className="min-h-screen bg-space-gradient text-white font-sans p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-4xl font-nasa font-bold">NEO Deflection App</h1>
           <button 
             onClick={onBack} 
             className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
           >
             &larr; Back to Methods
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Inputs */}
          <div className="md:col-span-1 bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
            {/* TABS */}
            <div className="flex border-b border-gray-600">
              <button
                onClick={() => setActiveTab('deltaV')}
                className={`flex-1 py-2 text-center font-semibold ${activeTab === 'deltaV' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              >
                Delta-V Mode
              </button>
              <button
                onClick={() => setActiveTab('intercept')}
                className={`flex-1 py-2 text-center font-semibold ${activeTab === 'intercept' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              >
                Intercept Mode
              </button>
            </div>
            
            {/* Deflection Time */}
            <ControlledInput label="Time of Deflection (D)" value={deflectionTime} setValue={setDeflectionTime} unit="days" />

            {/* TAB CONTENT */}
            {activeTab === 'deltaV' ? (
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <ControlledInput label="ΔVA" value={deltaVA} setValue={setDeltaVA} unit="mm/s" />
                <ControlledInput label="ΔVC" value={deltaVC} setValue={setDeltaVC} unit="mm/s" />
                <ControlledInput label="ΔVN" value={deltaVN} setValue={setDeltaVN} unit="mm/s" />
              </div>
            ) : (
              <div className="border-t border-gray-700 pt-4 text-center text-gray-400">
                Intercept Mode Inputs would be here.
              </div>
            )}

            {/* NEO INPUTS */}
            <div className="border-t border-gray-700 pt-4 space-y-3">
              <h3 className="text-xl font-bold text-blue-300 text-center mb-2">Simulated NEO</h3>
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Object:</label>
                <select value={selectedObject} onChange={(e) => setSelectedObject(e.target.value)} className="bg-gray-900 border border-gray-600 rounded-md p-2 w-2/3">
                  <optgroup label="Special Purpose">
                    <option value="pdc25">PDC25 a=1.65 i=11 e=0.39</option>
                    <option value="pdc23">PDC23 a=0.99 i=10 e=0.09</option>
                  </optgroup>
                  <optgroup label="Apollo Orbits">
                    <option value="vi573">SIM1 a=1.48 i=23 e=0.33</option>
                    <option value="vi124">SIM2 a=2.06 i=7 e=0.58</option>
                  </optgroup>
                </select>
              </div>
               <div className="flex items-center justify-between">
                <label className="text-gray-300">Diameter (km):</label>
                <input type="text" value={diameter} onChange={(e) => setDiameter(e.target.value)} className="bg-gray-900 border border-gray-600 rounded-md p-2 w-2/3"/>
              </div>
               <div className="flex items-center justify-between">
                <label className="text-gray-300">Density (g/cm³):</label>
                <select value={density} onChange={(e) => setDensity(e.target.value)} className="bg-gray-900 border border-gray-600 rounded-md p-2 w-2/3">
                  <option value="1.5">1.5 (Porous Rock)</option>
                  <option value="3.0">3.0 (Dense Rock)</option>
                  <option value="8.0">8.0 (Iron)</option>
                </select>
              </div>
                 <div className="flex items-center justify-between">
                <label className="text-gray-300">Beta:</label>
                <select value={beta} onChange={(e) => setBeta(e.target.value)} className="bg-gray-900 border border-gray-600 rounded-md p-2 w-2/3">
                  <option>1</option>
                  <option>1.5</option>
                  <option>2</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Results & Plots */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
              <p className="text-gray-500">Distance Chart Placeholder</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
                <p className="text-gray-500">Orbit Plot Placeholder</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
                 <p className="text-gray-500">B-Plane Plot Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KineticImpactor;