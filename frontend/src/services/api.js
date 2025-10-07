import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

export const api = {
  // Health check
  healthCheck: () => apiClient.get('/health'),

  // Document APIs
  uploadDocument: (formData) => 
    apiClient.post('/api/v1/upload_doc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getDocuments: (params = {}) => 
    apiClient.get('/api/v1/documents', { params }),

  // Claims APIs
  getClaims: (params = {}) => 
    apiClient.get('/api/v1/claims', { params }),

  updateClaimStatus: (claimId, updateData) =>
    apiClient.put(`/api/v1/claims/${claimId}/status`, updateData),

  getClaimVerificationHistory: (claimId) =>
    apiClient.get(`/api/v1/claims/${claimId}/verification-history`),

  // Parcels APIs
  getParcels: (params = {}) => 
    apiClient.get('/api/v1/parcels', { params }),

  // DSS APIs
  getDSSRecommendations: (params = {}) => 
    apiClient.get('/api/v1/dss/recommend', { params }),

  getDSSRecommendation: (params = {}) => 
    apiClient.get('/api/v1/dss/recommend', { params }),
};

export default apiClient;