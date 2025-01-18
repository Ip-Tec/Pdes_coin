import axios from "axios";
import API, { apiUrl } from "./api";
import { ErrorResponse, UtilityProps } from "../utils/type";
import { toast } from "react-toastify";

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
export const searchUser = async (
  query: string,
  path: "search" | "crypto" | "transaction"
) => {
  const url: Record<typeof path, string> = {
    search: "search-user",
    crypto: "search-crypto-user",
    transaction: "search-transaction-user",
  };

  try {
    const response = await API.get(
      apiUrl(`/admin/${url[path]}?query=${query}`)
    );
    console.log({ response });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      console.error(errorData);
      return errorData;
    }
    throw new Error("Network error. Please try again.");
  }
};

// Add account user will deposit to
export const addAccount = async (data: {
  account_name: string;
  account_number: string;
  account_type: string;
  max_deposit_amount: number;
}) => {
  try {
    const response = await API.post(apiUrl("/admin/add-account"), data);
    console.log({ response });
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      toast.error(errorData?.error);
      console.error(errorData);
      return errorData;
    }
    throw new Error("Network error. Please try again.");
  }
};

// Add utility data
export const addUtility = async (data: UtilityProps) => {
  try {
    const response = await API.post(apiUrl("/admin/utility"), data);
    console.log({ response });
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      toast.error(errorData?.error);
      console.error(errorData);
      return errorData;
    }
    throw new Error("Network error. Please try again.");
  }
};

// Add utility data
export const confirmUserDeposit = async (data: any) => {
  try {
    const response = await API.post(apiUrl("/admin/add-money"), data);
    console.log({ response });
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      toast.error(errorData?.error);
      toast.error(errorData?.message);
      console.error(errorData);
      return errorData;
    }
    throw new Error("Network error. Please try again.");
  }
};
