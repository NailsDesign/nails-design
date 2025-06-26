const API_BASE_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'https://nails-design.onrender.com'
    : 'https://nails-design.onrender.com';

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
