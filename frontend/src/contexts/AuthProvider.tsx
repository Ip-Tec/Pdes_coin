import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import {
  
  loginUser,
  getUser as getUserAPI,
  websocketUrl,
  refreshTokenAPI,
  LogoutUser,
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
  // Instead of checking localStorage, we'll initialize with false and then determine auth via getUserAPI
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
    setIsLoading(true);
    try {
      // Call login API
      const response = await loginUser({ email, password });
      console.log('Login response:', response);
      
      // Explicitly check for tokens in the response
      const { user } = response;
      
      if (!user) {
        throw new Error("User data missing from login response");
      }
      
      // Log cookies for debugging
      console.log('Cookies after login:', document.cookie);
      
      // Set user data and authentication state
      setUser(user);
      setIsAuth(true);
      
      // Set roles
      const role = user.role || "USER";
      setUserRoles(Array.isArray(role) ? role : [role]);
      
      // Initialize socket with fresh token
      initializeSocket();
      
      toast.success("Login successful!");
      return user;
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed");
      setUser(null);
      setIsAuth(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Disconnect socket first
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      
      // Call logout API endpoint
      await LogoutUser();
      
      // After successful logout API call, clear state
      setUser(null);
      setIsAuth(false);
      setUserRoles([]);
      
      // Manual cookie deletion as a fallback
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Clear any localStorage items
      localStorage.removeItem('user');
      
      // Use window.location to ensure a complete page refresh
      toast.success("Logged out successfully");
      
      // Wait a moment to ensure clean state before redirect
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      
    } catch (error) {
      console.error("Logout error:", error);
      
      // Force logout even if API call fails
      setUser(null);
      setIsAuth(false);
      setUserRoles([]);
      
      // Manual cookie deletion as a fallback
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      toast.warning("Logged out with some errors - please refresh the page");
      
      // Redirect anyway
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuthToken = async () => {
    try {
      setIsLoading(true);
      // Call the refresh token API endpoint
      await refreshTokenAPI();
      
      // Get the user info again to confirm authentication
      const userData = await getUserAPI();
      if (userData) {
        setUser(userData);
        setIsAuth(true);
        // Re-initialize socket with fresh tokens
        if (socket) {
          socket.disconnect();
        }
        initializeSocket();
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // Clear auth state on failure
      setUser(null);
      setIsAuth(false);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSocket = () => {
    // Close existing socket if any
    if (socket) {
      socket.disconnect();
    }

    // Get access token from cookies
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const token = getCookieValue('access_token');
    
    // Connect with auth token in query params (for WebSocket)
    const newSocket = io(`${import.meta.env.VITE_API_URL}`, {
      withCredentials: true,
      transports: ['websocket'],
      query: token ? { token } : undefined
    });

    // Set up event handlers
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setSocket(newSocket);
    });

    newSocket.on('error', (error) => {
      console.error('WebSocket Error:', error);
    });
    
    return newSocket;
  };

  const getUser = async () => {
    setIsLoading(true);
    try {
      const userData = await getUserAPI();
      if (userData) {
        setUser(userData);
        setIsAuth(true);
        // Set roles from user data
        const role = userData.role || "USER";
        setUserRoles(Array.isArray(role) ? role : [role]);
        return userData;
      } else {
        setUser(null);
        setIsAuth(false);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user", error);
      setUser(null);
      setIsAuth(false);
      return null;
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
