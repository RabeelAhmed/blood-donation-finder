import axios from 'axios';

// Get API URL from env
const rawBaseURL = import.meta.env.VITE_API_URL;

// Create consistent baseURL: ensure it ends with /
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;

const api = axios.create({
  baseURL,
  withCredentials: false,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Prevent double slashes when joining baseURL and config.url
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }

    const stored = localStorage.getItem('user');
    let user = null;
    try {
      user = stored ? JSON.parse(stored) : null;
    } catch {
      user = null;
    }

    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize error responses and handle 401s centrally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle unauthorized globally
      if (error.response.status === 401) {
        localStorage.removeItem('user');
        // Let the app's routing decide what to do next (e.g., PrivateRoute redirect)
      }

      const normalizedError = {
        ...error,
        message:
          error.response.data?.message ||
          error.message ||
          'An unexpected error occurred',
      };
      return Promise.reject(normalizedError);
    }

    return Promise.reject(error);
  }
);

export default api;
