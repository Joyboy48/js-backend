import axios from "axios";

// Dynamically resolve API endpoint based on how the app is being served
const isLocalVite = window.location.port === "5173" || window.location.port === "3000";
const API_BASE = isLocalVite ? "http://localhost:8000/api/v1" : "/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Super important for cookies/sessions
  headers: {
    "Content-Type": "application/json",
  },
});

// We can add interceptors here later if we want to handle token refreshes automatically!
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling, we can pop a toast notification here
    return Promise.reject(error);
  }
);

export default api;
