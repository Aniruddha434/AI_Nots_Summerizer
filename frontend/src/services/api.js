import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Attach JWT from localStorage if present
    const token = localStorage.getItem('auth:token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle common errors
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'An unexpected error occurred'
    
    // Create a standardized error object
    const standardError = {
      message,
      status: error.response?.status,
      data: error.response?.data
    }
    
    return Promise.reject(standardError)
  }
)

// API methods
export const transcriptAPI = {
  // Upload transcript (file or text)
  upload: async (data) => {
    const formData = new FormData()
    
    if (data.file) {
      formData.append('file', data.file)
    } else if (data.text) {
      formData.append('text', data.text)
    }
    
    if (data.uploaderId) {
      formData.append('uploaderId', data.uploaderId)
    }
    
    return api.post('/transcripts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // Get transcript by ID
  getById: (id) => api.get(`/transcripts/${id}`),
  
  // Get all transcripts
  getAll: (params = {}) => api.get('/transcripts', { params }),
  
  // Delete transcript
  delete: (id) => api.delete(`/transcripts/${id}`)
}

export const summaryAPI = {
  // Generate summary
  generate: (data) => api.post('/generate', data),
  
  // Get summary by ID
  getById: (id) => api.get(`/summaries/${id}`),
  
  // Update summary
  update: (id, data) => api.put(`/summaries/${id}`, data),
  
  // Get all summaries
  getAll: (params = {}) => api.get('/summaries', { params }),
  
  // Get summary versions
  getVersions: (id) => api.get(`/summaries/${id}/versions`),
  
  // Delete summary
  delete: (id) => api.delete(`/summaries/${id}`)
}

export const shareAPI = {
  // Share summary via email
  share: (data) => api.post('/share', data),
  
  // Get sharing status
  getStatus: () => api.get('/share/status'),
  
  // Get sharing history
  getHistory: (summaryId) => api.get(`/share/history/${summaryId}`),
  
  // Test email service (development only)
  test: (email) => api.post('/share/test', { email })
}

// Utility functions
export const handleApiError = (error) => {
  console.error('API Error:', error)
  
  // Return user-friendly error message
  if (error.status === 400) {
    return error.message || 'Invalid request. Please check your input.'
  } else if (error.status === 401) {
    return 'Authentication required. Please log in.'
  } else if (error.status === 403) {
    return 'Access denied. You do not have permission to perform this action.'
  } else if (error.status === 404) {
    return 'The requested resource was not found.'
  } else if (error.status === 429) {
    return 'Too many requests. Please try again later.'
  } else if (error.status >= 500) {
    return 'Server error. Please try again later.'
  } else {
    return error.message || 'An unexpected error occurred.'
  }
}

export default api
