import axios from "axios";

export const BACKEND_BASE_URL = 'http://localhost:5000/api/v1';

export const axiosClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
