import axios from "axios";
import {
  AccountDetails,
  ChangePassword,
  ErrorResponse,
  ForgetPassword,
  ResetPassword,
  User,
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
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor
API.interceptors.request.use(
  config => {
    // Add the token to every request
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor with better error handling
API.interceptors.response.use(
  response => response,
  error => {
    // Don't reject timeout errors immediately - log them for debugging
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.error('Request timed out:', error.config?.url);
      // Return a custom error object instead of rejecting
      return Promise.resolve({ 
        data: null, 
        error: 'Request timed out. Please try again.'
      });
    }
    
    // For 401 errors, clear authentication
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log('Unauthorized request, clearing auth state');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
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
export const refreshTokenAPI = async () => {
  try {
    const response = await API.post(apiUrl("/auth/refresh-token"));
    return response.data.access_token; // Return new access token from the server response
  } catch (error) {
    // Handle errors as before
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      console.error(errorData?.message || "Failed to refresh token");
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
    const { user, access_token, refresh_token } = response.data;

    // console.log({ user, access_token, refresh_token });

    return { user, access_token, refresh_token };
  } catch (error) {
    console.log({ error });

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
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No token found, skipping user info request');
      return null;
    }
    
    console.log('Fetching user info...');
    const response = await API.get<User>(apiUrl("/users/users_info"));
    
    console.log('User info fetched successfully');
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
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
// Get Transaction History Socket
export const getTransactionHistorySocket = async () => {
  try {
    const response = await API.get(apiUrl("/transactions/history-socket"));
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

// Get Trade History
export const getTradeHistory = async () => {
  try {
    const response = await API.get(apiUrl("/transactions/trade-history"));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      console.error("Failed to fetch transactions", error.response?.data);
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
export const withdrawFunds = async (accountDetails: AccountDetails) => {
  // console.log({ accountDetails });

  try {
    const response = await API.post(apiUrl("/transactions/withdraw"), {
      ...accountDetails,
    });

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      console.error("Withdraw Error:", errorData);
      throw new Error(errorData?.message || "Withdraw failed");
    }
    console.error("Network error. Please try again.");
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
  price: { pdes_sell_price: number; pdes_buy_price: number }
) => {
  // if (action == "sell") {
  //   toast.error("You can't sell PDES");
  //   return { error: "You can't sell PDES" };
  // }
  try {
    const response = await API.post(apiUrl("/transactions/buy_sell"), {
      action,
      amount,
      price,
    });
    // console.log({ response });
    toast.info(response.data.message);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      toast.error(errorData?.message);
      // console.log({ errorData });

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
    const response = await API.get(apiUrl("/utility/current-price"));
    return response.data;
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
    // console.log(error);

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
        apiUrl(`/account/get-crypto-address?crypto=${crypto}`)
      );

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
  getAllCryptoAccount: async (): Promise<AccountDetail> => {
    try {
      const response = await API.get<AccountDetail>(
        apiUrl(`/account/get-all-crypto-address`)
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        }
        const errorData: ErrorResponse | string | undefined =
          error.response?.data || error.message;

        console.error("Error retrieving account:", errorData);
        toast.error(
          typeof errorData === "string"
            ? errorData
            : errorData?.error || "Error retrieving account"
        );
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
      const response = await API.post(apiUrl("/account/create-account"));
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

// For Change Password
export const changePassword = async ({
  oldPassword,
  newPassword,
}: ChangePassword): Promise<{ message: string } | ErrorResponse> => {
  try {
    const response = await API.post(apiUrl("/auth/change-password"), {
      oldPassword,
      newPassword,
    });

    // console.log(response);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      // console.log({ error });
      // console.log({ errorData });
      toast.error(errorData?.message);

      throw new Error(errorData?.message || "Failed to change password");
    }
    throw new Error("Failed to change password.");
  }
};

// For Forget Password
export const forgetPassword = async ({
  email,
}: ForgetPassword): Promise<{ message: string } | ErrorResponse> => {
  try {
    const response = await API.post(apiUrl("/auth/forget-password"), {
      email,
    });

    // console.log(response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      // console.log({ errorData });
      return errorData;
      throw new Error(
        errorData?.message + `/n Failed to send password reset email`
      );
    }
    throw new Error("Failed to send password reset email.");
  }
};

// For Reset Password (Authenticated User)
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

    // console.log(response);

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

// Get Depost accoun detail
export const getDepositAccountDetail = async () => {
  try {
    const response = await API.get(
      apiUrl("/transactions/random_deposit_account")
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      const errorData: ErrorResponse = error.response?.data;
      toast.error(errorData?.message);

      throw new Error(errorData?.message || "Failed to reset password");
    }
    throw new Error("Failed to reset password.");
  }
};

// Updated LogoutUser function for JWT-based auth
export const LogoutUser = async () => {
  try {
    const token = localStorage.getItem('access_token');
    
    // Only attempt to call the logout endpoint if we have a token
    if (token) {
      const response = await API.post(apiUrl("/auth/logout"), {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    }
    return { message: "Logged out locally" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ErrorResponse = error.response?.data;
      console.error("Logout API error:", errorData);
      throw new Error(errorData?.message || "Logout failed");
    }
    throw new Error("Network error during logout");
  }
};

export default API;
