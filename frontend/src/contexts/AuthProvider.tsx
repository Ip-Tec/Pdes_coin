import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { jwtDecode } from "jwt-decode";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import {
  refreshTokenAPI,
  getTransactionHistory,
  loginUser,
  getUser as getUserAPI,
  websocketUrl,
  // LogoutUser,
} from "../services/api";
import {
  TradeHistory,
  TradePrice,
  TransactionHistory,
  User,
} from "../utils/type";

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
  const [isAuth, setIsAuth] = useState<boolean>(() => {
    const token = sessionStorage.getItem("authToken");
    return !!token && !isTokenExpired(token);
  });

  const [userRoles, setUserRoles] = useState<string[]>([
    "USER",
    "MODERATOR",
    "SUPPORT",
    "ADMIN",
    "SUPER_ADMIN",
    "DEVELOPER",
    "OWNER",
  ]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [trade, setTrade] = useState<TradeHistory[]>([]);
  const [tradePrice, setTradePrice] = useState<TradePrice>({
    pdes_buy_price: 0,
    pdes_sell_price: 0,
    pdes_market_cap: 0,
    pdes_circulating_supply: 0,
    pdes_supply_left: 0,
    pdes_total_supply: 0,
  });
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (token && !isTokenExpired(token)) {
      setIsAuth(true);
      getUser().catch(() => logout());
    } else {
      sessionStorage.clear();
      setIsAuth(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!isAuth || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Only create a new socket if one doesn't exist.
    if (!socket) {
      const newSocket = createSocket(token);
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to WebSocket server");
        newSocket.emit("get_transaction_history");
        newSocket.emit("get_trade_history");
        newSocket.emit("get_current_price");
      });

      // Listen for transaction history events:
      newSocket.on("get_transaction_history", (data) => {
        setTransactions(data.transactions || data);
        // console.log("Transaction History:", { data });
      });

      // Listen for trade history events:
      newSocket.on("get_trade_history", (data) => {
        // console.log("Trade History:", data);
        setTrade(data.trade_history || data);
      });

      // Listen for current price events:
      newSocket.on("trade_price", (data: TradePrice) => {
        setTradePrice(data);
      });

      newSocket.on("error", (error) => {
        console.error("WebSocket Error:", error);
      });

      // Cleanup on unmount:
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuth]); // Notice: Only depends on isAuth (and/or token from sessionStorage)

  const login = async (email: string, password: string) => {
    try {
      const existingToken = sessionStorage.getItem("authToken");
      if (existingToken && !isTokenExpired(existingToken)) {
        toast.info("User is already logged in.");
      }
      setIsLoading(true);

      const {
        user: userData,
        access_token,
        refresh_token,
      } = await loginUser({
        email,
        password,
      });

      setUser(userData);
      setUserRoles(userData.role);
      sessionStorage.setItem("authToken", access_token);
      sessionStorage.setItem("refreshToken", refresh_token);
      setIsAuth(true);
      setIsLoading(false);

      if (userData.is_blocked || userData.sticks >= 2) {
        toast.error("Your account is under review or blocked.");
        logout();
        return;
      }

      toast.success("Login successful!");

      const transactions = await getTransactionHistory();
      setTransactions(transactions);

      const newSocket = createSocket(access_token);
      setSocket(newSocket);
      newSocket.emit("get_current_price");
      newSocket.emit("get_trade_history");
      newSocket.emit("get_transaction_history");
      // console.log("Auth Provider:", { userData, access_token, refresh_token });
      return userData;
    } catch (error) {
      setIsLoading(false);
      toast.error("Login failed");
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    try {
      // const response = await LogoutUser();
      // if (response.message) {
      // toast.success(response.message);
      setIsLoading(true);
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("refreshToken");
      setIsAuth(false);
      setUser(null);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      // }
    } catch (error: unknown | Error) {
      setIsLoading(false);
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

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

  const getUser = async () => {
    setIsLoading(true);
    try {
      const userData = await getUserAPI();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        loading: isLoading,
        setUser,
        getUser,
        trade,
        tradePrice,
        transactions,
        login,
        logout,
        refreshAuthToken,
        roles: userRoles,
        isAllowed: (role: string) => (user ? userRoles.includes(role) : false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
