import axios from "axios";
import { ErrorResponse, ResetPassword, User } from "../utils/type";

// Create API instance
const prod = import.meta.env.PROD;
const url = prod
  ? import.meta.env.REACT_APP_API_URL
  : import.meta.env.VITE_API_URL;

// Create API instance
const API = axios.create({
  baseURL: url || "https://pdes-coin.onrender.com/api",
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
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to generate endpoint URLs
export const apiUrl = (endpoint: string) =>
  `${API.defaults.baseURL}${endpoint}`;

// Check token validity
export const checkTokenValidity = async (token: string): Promise<boolean> => {
  try {
    const response = await API.get(apiUrl("/auth/validate-token"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      console.error(errorData?.message || "Failed to fetch Token");

      throw new Error(errorData?.message || "Failed to update validate token");
    }
    throw new Error("Token validation failed.");
  }
};

// Refresh token
export const refreshTokenAPI = async (refreshToken: string) => {
  try {
    const response = await API.post(apiUrl("/auth/refresh-token"), {
      refreshToken,
    });
    return response.data.access_token; // Updated to use "access_token"
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      console.error(errorData?.message || "Failed to fetch Token");

      throw new Error(errorData?.message || "Failed to update refresh token");
    }
    throw new Error("Failed to refresh token.");
  }
};

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
export const loginUser = async (loginData: {
  email: string;
  password: string;
}) => {
  try {
    const response = await API.post(apiUrl("/auth/login"), loginData);
    const { access_token, refresh_token, user } = response.data;

    localStorage.setItem("authToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);

    console.log({ user, access_token, refresh_token });

    return { user, access_token, refresh_token };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Login failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Get user info
export const getUser = async (): Promise<User | null> => {
  try {
    const response = await API.get<User>(apiUrl("/users/"), {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    console.log(response);

    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null; // Return null if the user is not logged in or an error occurs
  }
};

// Get Transaction History
export const getTransactionHistory = async () => {
  try {
    const response = await API.get(apiUrl("/transactions/history"));

    return response.data.transactions;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      console.error(errorData?.message || "Failed to fetch transactions");
      return [];
    }
    console.error("Network error. Please try again.");
    return [];
  }
};

// Deposit Funds
export const depositFunds = async (amount: number) => {
  try {
    const response = await API.post(apiUrl("/transactions/deposit"), {
      amount,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Deposit failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Withdraw Funds
export const withdrawFunds = async (accountDetails: any) => {
  console.group({ accountDetails });
  try {
    const response = await API.post(apiUrl("/transactions/withdraw"), {
      ...accountDetails,
    });
    console.log(response);

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Withdraw failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Transfer Funds
export const transferFunds = async (amount: number, recipientId: string) => {
  try {
    const response = await API.post(apiUrl("/transactions/transfer"), {
      amount,
      recipient_id: recipientId,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Transfer failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Request Funds
export const requestFunds = async (amount: number) => {
  try {
    const response = await API.post(apiUrl("/transactions/request"), {
      amount,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Request failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Get Account Balance
export const getAccountBalance = async () => {
  try {
    const response = await API.get(apiUrl("/transactions/balance"));
    return response.data.balance;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      console.error(errorData?.message || "Failed to fetch balance");
      return 0;
    }
    console.error("Network error. Please try again.");
    return 0;
  }
};

// Buy/Sell PDES
export const buySellPdes = async (
  action: "buy" | "sell",
  amount: number,
  price: number
) => {
  try {
    const response = await API.post(apiUrl("/transactions/buy_sell"), {
      action,
      amount,
      price,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Buy/Sell transaction failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Update Price History
export const updatePriceHistory = async (priceData: {
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  volume: number;
}) => {
  try {
    const response = await API.post(
      apiUrl("/transactions/update_price_history"),
      priceData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Failed to update price history");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Fetch the current price of Pdes coin
export const fetchCurrentPrice = async () => {
  try {
    const response = await API.get(apiUrl("/transactions/get_current_price"));
    return response.data.current_price;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Failed to fetch current price");
    }
    throw new Error("Network error. Please try again.");
  }
};

// Fetch user Referral list
export const fetchUserReferralList = async () => {
  try {
    const response = await API.get(apiUrl("/users/referral"));
    // const response = await API.get(apiUrl("/transactions/get_user_activity"));

    return response.data.referrals;
  } catch (error) {
    console.log(error);

    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }

      const errorData: ErrorResponse = error.response?.data;
      throw new Error(
        errorData?.message || "Failed to fetch user referral list"
      );
    }
    throw new Error("Network error. Please try again.");
  }
};

// Types for request and response
interface CreateAccountRequest {
  user_id: number;
  username: string;
}

interface AccountDetail {
  id: number;
  user_id: number;
  BTC: string;
  ETH: string;
  LTC: string;
  USDC: string;
}

// API methods
export const AccountAPI = {
  /**
   * Create a new account
   * @param data - The user ID and username for creating the account
   * @returns The account details
   */
  createAccount: async (data: CreateAccountRequest): Promise<AccountDetail> => {
    try {
      const response = await API.post<AccountDetail>(
        apiUrl("/account/create_account"),
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        }
        const errorData: ErrorResponse = error.response?.data || error.message;
        console.error(
          "Error creating account:",
          error.response?.data || error.message
        );
        throw new Error(errorData?.message || "Error retrieving account");
      }
      throw new Error("Failed to create account");
    }
  },

  /**
   * Get account details by user ID
   * @param userId - The user ID for retrieving the account details
   * @returns The account details
   */
  getAccount: async (): Promise<AccountDetail> => {
    try {
      const response = await API.get<AccountDetail>(
        apiUrl(`/account/get_account`)
      );
      console.log(response);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        }
        const errorData: ErrorResponse | string | undefined =
          error.response?.data || error.message;

        console.error("Error retrieving account:", errorData);
        throw new Error(
          typeof errorData === "string"
            ? errorData
            : errorData?.message || "Error retrieving account"
        );
      }
      throw new Error("Failed to retrieve account");
    }
  },

  deleteWallet: async () => {
    try {
      const response = await API.delete(apiUrl("/account/delete_wallet"));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        }
        const errorData: ErrorResponse = error.response?.data;
        throw new Error(errorData?.message || "Failed to delete wallet");
      }
      throw new Error("Network error. Please try again.");
    }
  },

  generateNewWallet: async () => {
    try {
      const response = await API.post(apiUrl("/account/generate_new_wallet"));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        }
        const errorData: ErrorResponse = error.response?.data;
        throw new Error(errorData?.message || "Failed to generate new wallet");
      }
      throw new Error("Network error. Please try again.");
    }
  },
};

// Reset user password
export const resetPassword = async ({
  email,
  token,
  password,
  newPassword,
}: ResetPassword): Promise<User | ErrorResponse> => {
  try {
    const response = await API.post(apiUrl("/auth/reset-password"), {
      email,
      token,
      password,
      newPassword,
    });

    console.log(response);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      throw new Error(errorData?.message || "Failed to reset password");
    }
    throw new Error("Failed to reset password.");
  }
};

export default API;
