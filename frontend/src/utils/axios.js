import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // important for sending cookies
});

// No request interceptor needed because cookies are automatic

// Response interceptor for 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint (backend rotates refresh token & sets new cookie)
        await api.post('/auth/refresh-token', {}, { withCredentials: true });
        return api(originalRequest); // retry original request
      } catch (err) {
        // Redirect to login on failure
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export { api };
