// config/api.js

// Dynamically set the base API URL based on environment
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://nails-design.onrender.com';

// Helper function to construct full API URLs
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
