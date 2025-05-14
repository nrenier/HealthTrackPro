import { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

type User = {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

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
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        return false;
      }

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
      await fetch(`${baseUrl}/api/auth/logout`, {
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
}

export const useAuth = () => {
  return useContext(AuthContext);
};