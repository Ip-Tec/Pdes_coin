import { createContext, useContext } from "react";
import {
  User,
  TransactionHistory,
  TradeHistory,
  TradePrice,
} from "../utils/type";

export interface AuthContextType {
  isAuth: boolean;
  loading: boolean;
  user: User | null;
  getUser: () => Promise<User | null | undefined>;
  setUser: (user: User | null) => void;
  transactions: TransactionHistory[];
  trade: TradeHistory[];
  tradePrice: TradePrice;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuthToken: () => Promise<void>;
  roles: string[];
  isAllowed: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
