import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

type User = {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const { data: userData, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/user"],
    staleTime: 1000 * 60 * 5, // 5 minuti
    refetchOnWindowFocus: false,
    retry: false,
    onError: (error) => {
      console.error("Auth query error:", error);
      setUser(null);
    }
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        console.error("Login failed:", await response.text());
        return false;
      }

      const userData = await response.json();
      setUser(userData);
      await refetch();
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      console.log("Register payload:", { username, email, password: "******" });
      
      const response = await fetch(`${baseUrl}/api/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Registration failed:", response.status, errorText);
        return false;
      }

      const userData = await response.json();
      setUser(userData);
      await refetch();
      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      await fetch(`${baseUrl}/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      queryClient.clear();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}