import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { toast } from 'react-hot-toast'

// Initial state
const initialState = {
  // Simulation parameters
  simulationParams: {
    diameter_m: 100,
    velocity_km_s: 17,
    density_kg_m3: 3000,
    impact_angle_deg: 45,
    impact_lat: 0,
    impact_lon: 0,
  },
  
  // Simulation results
  impactMetrics: null,
  environmentalData: null,
  
  // Asteroid data
  selectedAsteroid: null,
  asteroidList: [],
  
  // Mitigation scenarios
  mitigationScenarios: [],
  selectedMitigationMethod: null,
  
  // UI state
  loading: false,
  error: null,
  activeTab: 'simulation',
  
  // Map state
  mapCenter: [0, 0],
  mapZoom: 2,
  
  // 3D visualization state
  showOrbit: true,
  showEarth: true,
  showAsteroid: true,
  animationSpeed: 1.0,
}

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SIMULATION_PARAMS: 'SET_SIMULATION_PARAMS',
  SET_IMPACT_METRICS: 'SET_IMPACT_METRICS',
  SET_ENVIRONMENTAL_DATA: 'SET_ENVIRONMENTAL_DATA',
  SET_SELECTED_ASTEROID: 'SET_SELECTED_ASTEROID',
  SET_ASTEROID_LIST: 'SET_ASTEROID_LIST',
  SET_MITIGATION_SCENARIOS: 'SET_MITIGATION_SCENARIOS',
  SET_SELECTED_MITIGATION_METHOD: 'SET_SELECTED_MITIGATION_METHOD',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_MAP_CENTER: 'SET_MAP_CENTER',
  SET_MAP_ZOOM: 'SET_MAP_ZOOM',
  SET_3D_VISUALIZATION_STATE: 'SET_3D_VISUALIZATION_STATE',
  RESET_SIMULATION: 'RESET_SIMULATION',
}

// Reducer
function simulationReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    
    case ActionTypes.SET_SIMULATION_PARAMS:
      return { ...state, simulationParams: { ...state.simulationParams, ...action.payload } }
    
    case ActionTypes.SET_IMPACT_METRICS:
      return { ...state, impactMetrics: action.payload, error: null }
    
    case ActionTypes.SET_ENVIRONMENTAL_DATA:
      return { ...state, environmentalData: action.payload }
    
    case ActionTypes.SET_SELECTED_ASTEROID:
      return { ...state, selectedAsteroid: action.payload }
    
    case ActionTypes.SET_ASTEROID_LIST:
      return { ...state, asteroidList: action.payload }
    
    case ActionTypes.SET_MITIGATION_SCENARIOS:
      return { ...state, mitigationScenarios: action.payload }
    
    case ActionTypes.SET_SELECTED_MITIGATION_METHOD:
      return { ...state, selectedMitigationMethod: action.payload }
    
    case ActionTypes.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload }
    
    case ActionTypes.SET_MAP_CENTER:
      return { ...state, mapCenter: action.payload }
    
    case ActionTypes.SET_MAP_ZOOM:
      return { ...state, mapZoom: action.payload }
    
    case ActionTypes.SET_3D_VISUALIZATION_STATE:
      return { ...state, ...action.payload }
    
    case ActionTypes.RESET_SIMULATION:
      return { ...state, impactMetrics: null, environmentalData: null, error: null }
    
    default:
      return state
  }
}

// Context
const SimulationContext = createContext()

// Provider component
export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState)

  // Action creators
  const actions = {
    setLoading: useCallback((loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading })
    }, []),

    setError: useCallback((error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error })
      if (error) {
        toast.error(error)
      }
    }, []),

    setSimulationParams: useCallback((params) => {
      dispatch({ type: ActionTypes.SET_SIMULATION_PARAMS, payload: params })
    }, []),

    setImpactMetrics: useCallback((metrics) => {
      dispatch({ type: ActionTypes.SET_IMPACT_METRICS, payload: metrics })
    }, []),

    setEnvironmentalData: useCallback((data) => {
      dispatch({ type: ActionTypes.SET_ENVIRONMENTAL_DATA, payload: data })
    }, []),

    setSelectedAsteroid: useCallback((asteroid) => {
      dispatch({ type: ActionTypes.SET_SELECTED_ASTEROID, payload: asteroid })
    }, []),

    setAsteroidList: useCallback((asteroids) => {
      dispatch({ type: ActionTypes.SET_ASTEROID_LIST, payload: asteroids })
    }, []),

    setMitigationScenarios: useCallback((scenarios) => {
      dispatch({ type: ActionTypes.SET_MITIGATION_SCENARIOS, payload: scenarios })
    }, []),

    setSelectedMitigationMethod: useCallback((method) => {
      dispatch({ type: ActionTypes.SET_SELECTED_MITIGATION_METHOD, payload: method })
    }, []),

    setActiveTab: useCallback((tab) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tab })
    }, []),

    setMapCenter: useCallback((center) => {
      dispatch({ type: ActionTypes.SET_MAP_CENTER, payload: center })
    }, []),

    setMapZoom: useCallback((zoom) => {
      dispatch({ type: ActionTypes.SET_MAP_ZOOM, payload: zoom })
    }, []),

    set3DVisualizationState: useCallback((state) => {
      dispatch({ type: ActionTypes.SET_3D_VISUALIZATION_STATE, payload: state })
    }, []),

    resetSimulation: useCallback(() => {
      dispatch({ type: ActionTypes.RESET_SIMULATION })
    }, []),

    // Complex actions
    updateSimulationParam: useCallback((key, value) => {
      dispatch({ type: ActionTypes.SET_SIMULATION_PARAMS, payload: { [key]: value } })
    }, []),

    loadAsteroidData: useCallback((asteroid) => {
      if (asteroid) {
        const params = {
          diameter_m: asteroid.diameter_avg_m || 100,
          velocity_km_s: asteroid.velocity_km_s || 17,
          density_kg_m3: asteroid.density_kg_m3 || 3000,
        }
        dispatch({ type: ActionTypes.SET_SIMULATION_PARAMS, payload: params })
        dispatch({ type: ActionTypes.SET_SELECTED_ASTEROID, payload: asteroid })
        toast.success(`Loaded data for ${asteroid.name}`)
      }
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: null })
    }, []),
  }

  const value = {
    ...state,
    ...actions,
  }

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}

// Hook to use the context
export function useSimulation() {
  const context = useContext(SimulationContext)
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider')
  }
  return context
}

export default SimulationContext
