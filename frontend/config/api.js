// API Configuration
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:4000',
  },
  production: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-domain.com',
  },
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = API_CONFIG[environment].baseURL;

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
}; 