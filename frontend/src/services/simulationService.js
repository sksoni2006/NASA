import api from './api'

// Impact simulation services
export const simulationService = {
  // Simulate asteroid impact
  async simulateImpact(params) {
    try {
      const response = await api.post('/api/impact/simulate', params)
      return response.data
    } catch (error) {
      throw new Error(`Simulation failed: ${error.message}`)
    }
  },

  // Batch simulate multiple scenarios
  async batchSimulate(scenarios) {
    try {
      const response = await api.post('/api/impact/batch-simulate', { scenarios })
      return response.data
    } catch (error) {
      throw new Error(`Batch simulation failed: ${error.message}`)
    }
  },

  // Compare multiple impact scenarios
  async compareImpacts(scenarios, comparisonMetrics = null) {
    try {
      const response = await api.post('/api/impact/compare', {
        scenarios,
        comparison_metrics: comparisonMetrics
      })
      return response.data
    } catch (error) {
      throw new Error(`Impact comparison failed: ${error.message}`)
    }
  },

  // Get environmental analysis for impact location
  async getEnvironmentalAnalysis(lat, lon, radiusKm = 100) {
    try {
      const response = await api.post('/api/impact/environmental-analysis', {
        impact_lat: lat,
        impact_lon: lon,
        radius_km: radiusKm
      })
      return response.data
    } catch (error) {
      throw new Error(`Environmental analysis failed: ${error.message}`)
    }
  },

  // Get comprehensive risk assessment
  async getRiskAssessment(params) {
    try {
      const response = await api.post('/api/impact/risk-assessment', params)
      return response.data
    } catch (error) {
      throw new Error(`Risk assessment failed: ${error.message}`)
    }
  }
}

// Asteroid data services
export const asteroidService = {
  // Get list of asteroids
  async getAsteroidList(source = 'sample', limit = 50, startDate = null, endDate = null) {
    try {
      const params = { source, limit }
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      
      const response = await api.get('/api/asteroid/list', { params })
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch asteroid list: ${error.message}`)
    }
  },

  // Get asteroid details by ID
  async getAsteroidDetails(asteroidId) {
    try {
      const response = await api.get(`/api/asteroid/${asteroidId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch asteroid details: ${error.message}`)
    }
  },

  // Create impact scenario for specific asteroid
  async createImpactScenario(asteroidId, impactParams = {}) {
    try {
      const response = await api.post(`/api/asteroid/${asteroidId}/impact-scenario`, impactParams)
      return response.data
    } catch (error) {
      throw new Error(`Failed to create impact scenario: ${error.message}`)
    }
  },

  // Search asteroids by criteria
  async searchAsteroids(searchCriteria) {
    try {
      const response = await api.get('/api/asteroid/search', { params: searchCriteria })
      return response.data
    } catch (error) {
      throw new Error(`Asteroid search failed: ${error.message}`)
    }
  },

  // Get asteroid statistics
  async getAsteroidStats() {
    try {
      const response = await api.get('/api/asteroid/stats')
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch asteroid statistics: ${error.message}`)
    }
  }
}

// Mitigation services
export const mitigationService = {
  // Compute deflection scenario
  async computeDeflection(asteroidData, deflectionMethod, deflectionParams, timeToImpactDays) {
    try {
      const response = await api.post('/api/mitigation/deflect', {
        asteroid_data: asteroidData,
        deflection_method: deflectionMethod,
        deflection_parameters: deflectionParams,
        time_to_impact_days: timeToImpactDays
      })
      return response.data
    } catch (error) {
      throw new Error(`Deflection computation failed: ${error.message}`)
    }
  },

  // Compare deflection methods
  async compareDeflectionMethods(asteroidData, timeToImpactDays) {
    try {
      const response = await api.post('/api/mitigation/compare-methods', {
        asteroid_data: asteroidData,
        time_to_impact_days: timeToImpactDays
      })
      return response.data
    } catch (error) {
      throw new Error(`Deflection method comparison failed: ${error.message}`)
    }
  },

  // Optimize deflection parameters
  async optimizeDeflection(asteroidData, deflectionMethod, timeToImpactDays, targetSuccessProbability = 0.95) {
    try {
      const response = await api.post('/api/mitigation/optimize', {
        asteroid_data: asteroidData,
        deflection_method: deflectionMethod,
        time_to_impact_days: timeToImpactDays,
        target_success_probability: targetSuccessProbability
      })
      return response.data
    } catch (error) {
      throw new Error(`Deflection optimization failed: ${error.message}`)
    }
  },

  // Simulate mitigation effects
  async simulateMitigation(originalImpactMetrics, deltaVMs, timeToImpactDays) {
    try {
      const response = await api.post('/api/mitigation/simulate-mitigation', {
        original_impact_metrics: originalImpactMetrics,
        delta_v_ms: deltaVMs,
        time_to_impact_days: timeToImpactDays
      })
      return response.data
    } catch (error) {
      throw new Error(`Mitigation simulation failed: ${error.message}`)
    }
  },

  // Assess deflection feasibility
  async assessDeflectionFeasibility(asteroidData, timeToImpactDays, missionConstraints = {}) {
    try {
      const response = await api.post('/api/mitigation/deflection-feasibility', {
        asteroid_data: asteroidData,
        time_to_impact_days: timeToImpactDays,
        mission_constraints: missionConstraints
      })
      return response.data
    } catch (error) {
      throw new Error(`Deflection feasibility assessment failed: ${error.message}`)
    }
  },

  // Generate mission planning recommendations
  async generateMissionPlan(asteroidData, deflectionMethod, timeToImpactDays, missionParameters = {}) {
    try {
      const response = await api.post('/api/mitigation/mission-planning', {
        asteroid_data: asteroidData,
        deflection_method: deflectionMethod,
        time_to_impact_days: timeToImpactDays,
        mission_parameters: missionParameters
      })
      return response.data
    } catch (error) {
      throw new Error(`Mission planning failed: ${error.message}`)
    }
  }
}

// Utility functions
export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return 'N/A'
  
  if (num >= 1e12) {
    return (num / 1e12).toFixed(decimals) + 'T'
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B'
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M'
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K'
  } else {
    return num.toFixed(decimals)
  }
}

export const formatScientific = (num, decimals = 2) => {
  if (num === null || num === undefined) return 'N/A'
  return num.toExponential(decimals)
}

export const formatDistance = (km, unit = 'km') => {
  if (km === null || km === undefined) return 'N/A'
  
  if (unit === 'km') {
    return formatNumber(km) + ' km'
  } else if (unit === 'miles') {
    return formatNumber(km * 0.621371) + ' miles'
  } else if (unit === 'earth_radii') {
    return formatNumber(km / 6371) + ' Earth radii'
  }
  
  return formatNumber(km) + ' km'
}

export const formatEnergy = (joules, unit = 'tnt_tons') => {
  if (joules === null || joules === undefined) return 'N/A'
  
  if (unit === 'tnt_tons') {
    const tntTons = joules / 4.184e9
    return formatNumber(tntTons) + ' tons TNT'
  } else if (unit === 'joules') {
    return formatScientific(joules) + ' J'
  } else if (unit === 'kilotons') {
    const kilotons = joules / 4.184e12
    return formatNumber(kilotons) + ' kt TNT'
  } else if (unit === 'megatons') {
    const megatons = joules / 4.184e15
    return formatNumber(megatons) + ' Mt TNT'
  }
  
  return formatScientific(joules) + ' J'
}

export const formatVelocity = (kmPerSec, unit = 'km_s') => {
  if (kmPerSec === null || kmPerSec === undefined) return 'N/A'
  
  if (unit === 'km_s') {
    return formatNumber(kmPerSec) + ' km/s'
  } else if (unit === 'm_s') {
    return formatNumber(kmPerSec * 1000) + ' m/s'
  } else if (unit === 'mph') {
    return formatNumber(kmPerSec * 2236.94) + ' mph'
  }
  
  return formatNumber(kmPerSec) + ' km/s'
}

export const getRiskLevelColor = (riskLevel) => {
  switch (riskLevel?.toLowerCase()) {
    case 'extreme':
      return 'text-red-600 bg-red-100'
    case 'high':
      return 'text-orange-600 bg-orange-100'
    case 'moderate':
      return 'text-yellow-600 bg-yellow-100'
    case 'low':
      return 'text-green-600 bg-green-100'
    case 'minimal':
      return 'text-blue-600 bg-blue-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export const getRiskLevelIcon = (riskLevel) => {
  switch (riskLevel?.toLowerCase()) {
    case 'extreme':
      return '🚨'
    case 'high':
      return '⚠️'
    case 'moderate':
      return '⚡'
    case 'low':
      return 'ℹ️'
    case 'minimal':
      return '✅'
    default:
      return '❓'
  }
}
