import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { jwtDecode } from "jwt-decode"; // Use the default import
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import {
  refreshTokenAPI,
  getTransactionHistory,
  loginUser,
  getUser as getUserAPI,
  websocketUrl,
} from "../services/api";
import { TradeHistory, TransactionHistory, User } from "../utils/type";

interface DecodedToken {
  exp: number;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token", error);
    return true;
  }
};

// Create a socket connection using the provided token.
const createSocket = (token: string | null): Socket => {
  return io(websocketUrl, {
    query: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Determine initial auth state based on the existence and validity of a token.
  const [isAuth, setIsAuth] = useState<boolean>(() => {
    const token = sessionStorage.getItem("authToken");
    return !!token && !isTokenExpired(token);
  });

  // Keep user data in memory only.
  const [user, setUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [trade, setTrade] = useState<TradeHistory[]>([]);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);

  // If a valid token exists but no user data is loaded, fetch user data.
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (token && !isTokenExpired(token)) {
      setIsAuth(true);
      // fetch user data again or retrieve it from sessionStorage
      getUser().catch(() => logout());
    } else {
      logout();
    }
  }, []);

  // Manage WebSocket connection when authentication state changes.
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!isAuth || !token) {
      // Disconnect any existing socket if not authenticated.
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = createSocket(token);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
      newSocket.emit("get_transaction_history");
      newSocket.emit("get_trade_history");
    });

    newSocket.on("get_transaction_history", (data) => {
      console.log("Transaction History:", data);
      setTransactions(data.transactions || data);
    });
    newSocket.on("get_trade_history", (data) => {
      console.log("Trade History:", data);
      setTrade(data.trade_history || data);
    });
    newSocket.on("transaction_history", (data) => {
      console.log("Real-time Transaction Update:", data);
      setTransactions(data.transactions || data);
    });
    newSocket.on("error", (error) => {
      console.error("WebSocket Error:", error);
    });

    // Clean up the socket when the effect is re-run or unmounted.
    return () => {
      newSocket.disconnect();
    };
  }, [isAuth]);

  // Login function: calls the API and updates in-memory auth state.
  const login = async (email: string, password: string) => {
    console.log({ email, password });
    
    try {
      const existingToken = sessionStorage.getItem("authToken");
      if (existingToken && !isTokenExpired(existingToken)) {
        toast.info("User is already logged in.");
        return;
      }

      const {
        user: userData,
        access_token,
        refresh_token,
      } = await loginUser({
        email,
        password,
      });
      console.log({ userData, access_token, refresh_token });
      
      setUser(userData);

      // Store tokens in sessionStorage. Do not store sensitive user data persistently.
      sessionStorage.setItem("authToken", access_token);
      sessionStorage.setItem("refreshToken", refresh_token);

      setIsAuth(true);
      setUser(userData);
      console.log({ userData });
      

      // Check if the account is blocked or under review.
      if (userData.is_blocked || userData.sticks >= 2) {
        toast.error("Your account is under review or blocked.");
        logout();
        return;
      }
      console.log({ isAuth, user });
      toast.success("Login successful!");

      // Fetch transactions immediately.
      const transactions = await getTransactionHistory();
      setTransactions(transactions);

      // Initialize WebSocket connection with the new token.
      const newSocket = createSocket(access_token);
      setSocket(newSocket);
      newSocket.emit("get_transaction_history");
      newSocket.emit("get_trade_history");
    } catch (error) {
      toast.error("Login failed");
      console.error("Login failed", error);
      throw error;
    }
  };

  // Logout: remove tokens and clear in-memory state.
  const logout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("refreshToken");
    setIsAuth(false);
    setUser(null);
    setTransactions([]);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  // Refresh the auth token when needed.
  const refreshAuthToken = async () => {
    try {
      const refreshToken = sessionStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        return;
      }
      const newToken = await refreshTokenAPI(refreshToken);
      sessionStorage.setItem("authToken", newToken);
      if (socket) socket.emit("update_token", newToken);
      setIsAuth(true);
    } catch (error) {
      console.error("Failed to refresh token", error);
      logout();
    }
  };

  // Fetch the current user's data. Sensitive data remains only in memory.
  const getUser = async () => {
    console.log({ isAuth, user });
    // if(!user){
    //   setIsAuth(false);
    // }
    try {
      const userData = await getUserAPI();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user", error);
      throw error;
    }
  };

  // On mount, check if the token is expired and refresh it if necessary.
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (token && isTokenExpired(token)) {
      refreshAuthToken();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        user,
        setUser,
        getUser,
        trade,
        transactions,
        login,
        logout,
        refreshAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
