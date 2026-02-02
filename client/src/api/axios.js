import axios from 'axios';

// Get API URL from env or fallback to Vercel backend
const rawBaseURL = import.meta.env.VITE_API_URL || 'https://blood-donation-finder-2zp3.vercel.app/api';

// Create consistent baseURL: ensure it ends with /
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;

const api = axios.create({
  baseURL,
  withCredentials: false, // Set to false for Vercel deployment
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Prevent double slashes when joining baseURL and config.url
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
