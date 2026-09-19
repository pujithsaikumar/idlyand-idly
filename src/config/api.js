// Centralized API Base URL configuration with auto-detection for Vercel & Production

export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'))
    ? 'https://idlyand-idly.onrender.com/api'
    : '/api');

export default API_BASE_URL;
