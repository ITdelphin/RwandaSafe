import axios from "axios";

const API = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("saferwanda_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("saferwanda_token");
            localStorage.removeItem("saferwanda_user");
        }
        return Promise.reject(error);
    }
);

export default API;
