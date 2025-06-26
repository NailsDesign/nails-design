// config/api.js

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://nails-design.onrender.com';

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
