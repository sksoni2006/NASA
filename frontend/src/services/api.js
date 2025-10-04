import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens or other headers here
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', error)
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error'
      throw new Error(message)
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection')
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
)

export default api
