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

  const [user, setUser] = useState<User | null>(null);
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
      logout();
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

    if (!socket) {
      const newSocket = createSocket(token);
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to WebSocket server");
        if (newSocket.connected) {
          newSocket.emit("get_transaction_history");
          newSocket.emit("get_trade_history");
        }
      });

      newSocket.on("get_transaction_history", (data) => {
        console.log("Transaction History:", data);
        setTransactions(data.transactions || data);
      });

      newSocket.on("get_trade_history", (data) => {
        console.log("Trade History:", data);
        setTrade(data.trade_history || data);
      });

      newSocket.on("get_current_price", (data: TradePrice) => {
        console.log("Trade Price:", data);
        setTradePrice(data);
      });

      newSocket.on("transaction_history", (data) => {
        console.log("Real-time Transaction Update:", data);
        setTransactions(data.transactions || data);
      });

      newSocket.on("error", (error) => {
        console.error("WebSocket Error:", error);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuth, socket]);

  const login = async (email: string, password: string) => {
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

      setUser(userData);
      sessionStorage.setItem("authToken", access_token);
      sessionStorage.setItem("refreshToken", refresh_token);
      setIsAuth(true);

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
      newSocket.emit("get_transaction_history");
      newSocket.emit("get_trade_history");
      newSocket.emit("get_current_price");

    } catch (error) {
      toast.error("Login failed");
      console.error("Login failed", error);
    }
  };

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
    try {
      const userData = await getUserAPI();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user", error);
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
        setUser,
        getUser,
        trade,
        tradePrice,
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
