import axios from "axios";
import API, { apiUrl } from "./api";
import { ErrorResponse } from "../utils/type";

// Transfer Funds
export const getDashboardTotal = async () => {
  try {
    const response = await API.post(apiUrl("/admin/get-dashboard-total"));
    // console.log({ response });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Transfer failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Transfer Funds
export const getTransactionTrends = async () => {
  try {
    const response = await API.get(apiUrl("/admin/get-transaction-trends"));
    // console.log({ response });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Transfer failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Get Top Referrers
export const getTopReferrers = async () => {
  try {
    const response = await API.get(apiUrl("/admin/get-top-referrers"));
    // console.log({ response });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Transfer failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Get data overview
export const getDataOverview = async () => {
  try {
    const response = await API.get(apiUrl("/admin/get-data-overview"));
    // console.log({ response });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Transfer failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Get Top Users with the highest Balance
export const getTopUsersByBalance = async () => {
  try {
    const response = await API.get(apiUrl("/admin/get-top-users-by-balance"));
    // console.log({ response });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      console.error(errorData);

      throw new Error(errorData?.message || "Transfer failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Search for a user
export const searchUser = async (query: string) => {
  try {
    const response = await API.get(apiUrl(`/admin/search-user?query=${query}`));
    console.log({ response });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      console.error(errorData);
      return errorData;
    //   throw new Error(errorData?.message || "Transfer failed");
    }
    throw new Error("Network error. Please try again.");
  }
};
