import axios from 'axios';

// Get API URL from env or fallback to local
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create consistent baseURL: ensure it ends with /
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;

const api = axios.create({
  baseURL,
  withCredentials: true, // Important for cookies/sessions if needed
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
