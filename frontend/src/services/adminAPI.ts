import axios from "axios";
import {
  User,
  UtilityProps,
  ErrorResponse,
  RewardSettingFormData,
  confirmUserDepositProps,
} from "../utils/type";
import { toast } from "react-toastify";

// Create API instance
const prod = import.meta.env.PROD || true;
export const url = prod
  ? "https://pedex.duckdns.org/api"
  : // ? import.meta.env.REACT_APP_API_URL
    import.meta.env.VITE_API_URL;

export const websocketUrl = prod
  ? "wss://pedex.duckdns.org/"
  : import.meta.env.VITE_API_WEBSOCKET_URL;

export const feURL = prod
  ? "https://pedex.vercel.app/"
  : import.meta.env.VITE_EF_URL_LOCAL;
// Create API instance
const API = axios.create({
  baseURL: url,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Helper function to generate endpoint URLs
export const apiUrl = (endpoint: string) =>
  `${API.defaults.baseURL}${endpoint}`;

// Get Cookies from the browser
export const getCookies = () => {
  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    console.log({ key, value });
    return acc;
  }, {} as { [key: string]: string });
  return cookies;
};

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

// Search for user's
export const searchUser = async (
  query: string,
  path: "search" | "crypto" | "transaction" | "deposits"
) => {
  const url: Record<typeof path, string> = {
    search: "search-user",
    crypto: "search-crypto-user",
    transaction: "search-transaction-user",
    deposits: "search-deposits",
  };

  try {
    const response = await API.get(
      apiUrl(`/admin/${url[path]}?query=${query}`)
    );
    // console.log(response);
    // console.log(response.data);
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
    // console.log({ response });
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
    // console.log({ response });
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
export const confirmUserDeposit = async (data: confirmUserDepositProps) => {
  console.log({ data });

  try {
    const response = await API.post(apiUrl("/admin/add-money"), data);
    // console.log({ response });
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      toast.error(errorData?.error);
      toast.error(errorData?.message);
      if (errorData?.message === "Token has expired!") {
        window.location.href = "/login";
      }
      console.error(error);
      console.error(errorData);
      return errorData;
    }
    throw new Error("Network error. Please try again.");
  }
};

// get_transaction_proportions
export const getProportionChart = async (type: string) => {
  try {
    const response = await API.get(apiUrl(`/admin/proportions?type=${type}`));
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

// distribution-over-time
export const distributionOverTime = async () => {
  try {
    const response = await API.get(apiUrl("/admin/distribution-over-time"));
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

// configure-reward-setting
export const configureRewardSetting = async (data: RewardSettingFormData) => {
  try {
    const response = await API.post(
      apiUrl("/admin/configure-reward-setting"),
      data
    );
    // console.log({ response });
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

// download Users
export const handleDownloadApi = async (url: string) => {
  try {
    const response = await API.get(`/admin${url}`, {
      responseType: "blob",
    });

    // Create a downloadable file link
    const blob = new Blob([response.data], { type: "text/csv" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;

    // Extract filename from headers or use a default name
    const contentDisposition = response.headers["content-disposition"];
    let filename = url + ".csv";
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match && match[1]) filename = match[1];
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${filename} downloaded successfully!`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      toast.error(error.response.data || "Error during download.");
    } else {
      toast.error("Network error. Please try again.");
    }
    console.error(error);
  }
};

// Update User

export const updateUser = async (data: User) => {
  try {
    const response = await API.put(apiUrl("/admin/update-user"), data);
    // console.log({ response });
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

// Admin change password
export const changePassword = async (data: User, password: string) => {
  try {
    const response = await API.put(apiUrl("/admin/change-password"), {
      ...data,
      password,
    });
    // console.log({ response });
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

// 1️⃣ Get user referrer and reward
export const getReferrerAndReward = async (userId: number) => {
  try {
    const response = await API.get(apiUrl(`/admin/referrer/${userId}`));
    toast.success("Referrer details fetched successfully");
    console.log({ response });
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

// 2️⃣ Get all referrals of a specific user
export const getReferrals = async (userId: number = 6) => {
  try {
    const response = await API.get<{ referrals: User[] }>(
      apiUrl(`/admin/referrals/${userId}`)
    );
    toast.success("Referrals fetched successfully");
    console.log({ response });
    return response.data.referrals;
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

// 3️⃣ Get top referrers (default limit: 10)
export const getTopReferrersAdminPage = async (limit: number = 10) => {
  try {
    const response = await API.get<{ top_referrers: User[] }>(
      apiUrl(`/admin/top-referrers?limit=${limit}`)
    );
    toast.success("Top referrers fetched successfully");
    console.log({ response });
    return response.data.top_referrers;
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

// 4️⃣ Get referrers within a date range
export const getReferrersInRange = async (
  startDate: string,
  endDate: string
) => {
  try {
    const response = await API.get<{ referrers: User[] }>(
      apiUrl(
        `/admin/referrers-in-range?start_date=${startDate}&end_date=${endDate}`
      )
    );
    toast.success("Referrers in range fetched successfully");
    console.log({ response });
    return response.data.referrers;
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
