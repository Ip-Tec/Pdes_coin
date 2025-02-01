import { createContext, useContext } from "react";
import { User, TransactionHistory, TradeHistory } from "../utils/type";

export interface AuthContextType {
  isAuth: boolean;
  user: User | null;
  getUser: () => Promise<User | null>;
  setUser: (user: User | null) => void;
  transactions: TransactionHistory[];
  trade: TradeHistory[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuthToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
