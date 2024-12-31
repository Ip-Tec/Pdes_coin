import axios from "axios";
import { ErrorResponse } from "../utils/type";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // Default to localhost if .env is not set
});

// Register Function
export const registerUser = async (userData: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  try {
    console.log({ ...userData });
    const response = await API.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data; // Safely access the error response data
      throw new Error(errorData?.message || "Registration failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Login Function
export const loginUser = async (loginData: {
  email: string;
  password: string;
}) => {
  try {
    const response = await API.post("/auth/login", loginData);
    console.log("response", response.data);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data; // Safely access the error response data
      throw new Error(errorData?.message || "Login failed");
    }
    
    throw new Error("Network error. Please try again.");
  }
};

export default API;
