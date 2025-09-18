// client/src/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // e.g., "http://localhost:5000" or Render URL
});

// Add a request interceptor to attach the token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // attach token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
