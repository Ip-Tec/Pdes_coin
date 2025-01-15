import { jwtDecode } from "jwt-decode";
import {
  refreshTokenAPI,
  getTransactionHistory,
  loginUser,
  getUser as getUserAPI,
  url,
} from "../services/api";
import { TransactionHistory, User } from "../utils/type";
import { io } from "socket.io-client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { toast } from "react-toastify";

interface AuthContextType {
  isAuth: boolean;
  user: User | null;
  getUser: () => Promise<User | null>;
  setUser: (user: User | null) => void;
  transactions: TransactionHistory[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuthToken: () => Promise<void>;
}

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

export const AuthContext = createContext<AuthContextType | null>(null);

const socket = io(url + "/api/", {
  query: {
    token: localStorage.getItem("authToken"),
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"],
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuth, setIsAuth] = useState<boolean>(() => {
    const token = localStorage.getItem("authToken");
    return !!token && !isTokenExpired(token); // Check if token exists and is not expired
  });

  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  
  // Fetch user data from localStorage or sessionStorage
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Handle WebSocket events for transactions
  useEffect(() => {
    socket.on("transaction_history", (data) => {
      console.log("transaction_history", data);
      setTransactions(data.transactions);
    });

    socket.on("error", (error) => {
      console.error("WebSocket Error:", error);
    });

    return () => {
      socket.off("transaction_history");
      socket.off("error");
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Check if the user is already authenticated before attempting login
      const token = localStorage.getItem("authToken");
      if (token && !isTokenExpired(token)) {
        // User is already logged in
        toast.info("User is already logged in.");
        return;
      }

      const { user, access_token, refresh_token } = await loginUser({
        email,
        password,
      });

      sessionStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);

      // Now set the user data after successful login
      setIsAuth(true);
      setUser(user);

      // Emit event to fetch transactions after login
      socket.emit("get_transaction_history");
      toast.info("Login successful", user);
      console.log("Login successful", user);

      const { transactions } = await getTransactionHistory();
      setTransactions(transactions);
    } catch (error) {
      toast.error("Login failed");
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    // Clear out the token and set isAuth to false
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    setIsAuth(false);
    setUser(null);
    setTransactions([]);
  };

  const refreshAuthToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        return;
      }
      const newToken = await refreshTokenAPI(refreshToken);
      localStorage.setItem("authToken", newToken);
      setIsAuth(true);
    } catch (error) {
      console.error("Failed to refresh token", error);
      logout();
    }
  };

  // Fetch user data from the API
  const getUser = async () => {
    const user = await getUserAPI();
    console.log("getUser", user);
    sessionStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
