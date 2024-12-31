import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the AuthContext value
interface AuthContextType {
  isAuth: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuth, setIsAuth] = useState(() => {
    const token = sessionStorage.getItem("authToken");
    return !!token; // Check if a token exists in session storage
  });

  const login = (token: string) => {
    sessionStorage.setItem("authToken", token);
    setIsAuth(true);
  };

  const logout = () => {
    sessionStorage.removeItem("authToken");
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{ isAuth, login, logout }}>
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
