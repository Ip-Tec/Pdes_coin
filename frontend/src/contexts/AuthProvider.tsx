import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import {
  getTransactionHistory,
  loginUser,
  getUser as getUserAPI,
  websocketUrl,
  refreshTokenAPI,
} from "../services/api";
import {
  TradeHistory,
  TradePrice,
  TransactionHistory,
  User,
} from "../utils/type";

// No need for local token decoding now

const createSocket = (): Socket => {
  return io(websocketUrl, {
    withCredentials: true, // Ensure cookies are sent with the connection
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Instead of checking localStorage, we’ll initialize with false and then determine auth via getUserAPI
  const [isAuth, setIsAuth] = useState<boolean>(false);
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

  // On mount, check auth state via the user endpoint (which will read the HttpOnly cookie)
  useEffect(() => {
    setIsLoading(true);
    getUserAPI()
      .then((userData) => {
        setUser(userData);
        setIsAuth(true);
      })
      .catch(() => {
        setUser(null);
        setIsAuth(false);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Set up or tear down the socket connection based on isAuth
  useEffect(() => {
    if (!isAuth) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    if (!socket) {
      const newSocket = createSocket();
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to WebSocket server");
        newSocket.emit("get_transaction_history");
        newSocket.emit("get_trade_history");
        newSocket.emit("get_current_price");
      });

      newSocket.on("get_transaction_history", (data) => {
        setTransactions(data.transactions || data);
      });

      newSocket.on("get_trade_history", (data) => {
        setTrade(data.trade_history || data);
      });

      newSocket.on("trade_price", (data: TradePrice) => {
        setTradePrice(data);
      });

      newSocket.on("error", (error) => {
        console.error("WebSocket Error:", error);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuth]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Call loginUser which now sets HttpOnly cookies on the server response
      const { user: userData } = await loginUser({ email, password }, );
      setUser(userData);
      setUserRoles(userData.role);
      setIsAuth(true);
      setIsLoading(false);
      toast.success("Login successful!");

      const transactions = await getTransactionHistory();
      setTransactions(transactions);

      const newSocket = createSocket();
      setSocket(newSocket);
      newSocket.emit("get_current_price");
      newSocket.emit("get_trade_history");
      newSocket.emit("get_transaction_history");
      return userData;
    } catch (error) {
      setIsLoading(false);
      toast.error("Login failed");
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Perform any backend logout actions if needed.
      setUser(null);
      setIsAuth(false);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsLoading(false);
      toast.success("Logged out");
    } catch (error) {
      setIsLoading(false);
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  const refreshAuthToken = async () => {
    try {
      // Calling refreshTokenAPI should update the HttpOnly cookie
      await refreshTokenAPI();
      if (socket) socket.emit("update_token"); // if needed on socket side
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
