import { createContext, useContext, useState, ReactNode } from "react";
import { DashboardData, TransactionHistory, User } from "../utils/type";

// Define the type for the context
interface AuthContextType {
  isAuth: boolean;
  user: User | null; // Change to User | null
  transactions: TransactionHistory[];
  login: (token: string) => void;
  logout: () => void;
  setUserData: (user: User, transactions: TransactionHistory[]) => void;
  setDashboardData: (dashboardData: DashboardData) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuth, setIsAuth] = useState(() => {
    const token = localStorage.getItem("authToken");
    return !!token; // Check if a token exists in session storage
  });

  const [user, setUser] = useState<User | null>(null); // Change to User | null
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  ); // Change to DashboardData | null

  const login = (token: string) => {
    localStorage.setItem("authToken", token);
    setIsAuth(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuth(false);
    setUser(null); // Ensure user is set to null on logout
    setTransactions([]); // Clear data on logout
  };

  const setUserData = (user: User, transactions: TransactionHistory[]) => {
    setUser(user);
    setTransactions(transactions);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateDashboardData = (data: DashboardData) => {
    setDashboardData(data);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        user,
        transactions,
        login,
        logout,
        setUserData,
        setDashboardData, // Make sure the function is passed as well
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
