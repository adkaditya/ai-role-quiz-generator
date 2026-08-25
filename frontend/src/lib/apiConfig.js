import axios from "axios";

// ======================================================
// AXIOS CLIENT
// ======================================================

// VITE_API_URL:
// https://ai-role-quiz-generator.onrender.com
//
// Backend API base:
// https://ai-role-quiz-generator.onrender.com/api/v1

export const axiosClient = axios.create({
 baseURL: import.meta.env.VITE_API_URL,

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

axiosClient.interceptors.request.use(
  (config) => {
    // Local storage se login token nikaal rahe hain
    const token = localStorage.getItem("token");

    // Agar token available hai to Authorization header mein bhejo
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    console.error("API ERROR:", error);

    return Promise.reject(error);
  }
);