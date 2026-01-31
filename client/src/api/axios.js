import axios from 'axios';

// Ensure baseURL ends with /api/ for consistent joining
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;

const api = axios.create({
  baseURL,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // If the URL starts with a slash, it will ignore the baseURL's path.
    // We strip it here to ensure it appends to /api/ correctly.
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
