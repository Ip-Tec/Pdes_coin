import axios from "axios";
import { ErrorResponse } from "../utils/type";

// Create API instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Include cookies or credentials
});

// Add a request interceptor to include the token in headers
API.interceptors.request.use(
  (config) => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Helper function to generate endpoint URLs
const apiUrl = (endpoint: string) => `${API.defaults.baseURL}${endpoint}`;

// Register Function
export const registerUser = async (userData: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  try {
    const response = await API.post(apiUrl("/auth/register"), userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Registration failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Login Function
export const loginUser = async (loginData: { email: string; password: string }) => {
  try {
    const response = await API.post(apiUrl("/auth/login"), loginData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token); // Store the token in localStorage
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Login failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Get Dashboard Details (User and Transactions)
export const getDashboard = async () => {
  try {
    const userResponse = await API.get(apiUrl("/users/user")); // Token will be added automatically
    const user = userResponse.data.message;

    const transactionsResponse = await API.get(apiUrl("/transactions/history")); // Token will be added automatically
    const transactions = transactionsResponse.data.transactions;

    
    return { user, transactions };
  } catch (error) {
    // Gracefully handle errors without breaking
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      console.error(errorData?.message || "Failed to fetch dashboard data");
      return { user: null, transactions: [] };  // Return default/fallback data
    }
    console.error("Network error. Please try again.");
    return { user: null, transactions: [] };  // Return default/fallback data
  }
};


export default API;
