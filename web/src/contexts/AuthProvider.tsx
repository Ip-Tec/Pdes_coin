import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import {
  refreshTokenAPI,
  getTransactionHistory,
  loginUser,
  getUser as getUserAPI,
  url,
} from "../services/api";
import { TransactionHistory, User } from "../utils/type";

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
    return !!token && !isTokenExpired(token);
  });

  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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
      const token = localStorage.getItem("authToken");
      if (token && !isTokenExpired(token)) {
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

      setIsAuth(true);
      setUser(user);

      if (user.is_blocked) {
        toast.error("Your account has been blocked");
        logout();
        return;
      }

      if (user.sticks >= 2) {
        toast.error("Your account is under review, please wait for approval");
        logout();
        return;
      }
      if (user.sticks >= 3) {
        toast.error(
          "Your account has been temporarily blocked contact support for more information"
        );
        logout();
        return;
      }

      socket.emit("get_transaction_history");
      toast.info("Login successful", user);

      const { transactions } = await getTransactionHistory();
      setTransactions(transactions);
    } catch (error) {
      toast.error("Login failed");
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("transactions");
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

  const getUser = async () => {
    const user = await getUserAPI();
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
