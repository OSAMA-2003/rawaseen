"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, ApiClientError } from "../lib/api";
import { AuthLoginResponse, IUser } from "../types/auth";

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<IUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Bootstrap session from stored token or HTTP-only cookie on mount
  const refreshUser = useCallback(async () => {
    try {
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("rawasin_token") : null;
      if (storedToken) {
        setToken(storedToken);
      }

      const res = await api.get<IUser>("/auth/me");
      if (res.data) {
        setUser(res.data);
      }
    } catch (err: any) {
      // If 401 or invalid session, clear local state
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("rawasin_token");
        localStorage.removeItem("rawasin_user");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<IUser> => {
    setIsLoading(true);
    try {
      const res = await api.post<AuthLoginResponse>("/auth/login", {
        email,
        password,
      });

      const { user: loggedInUser, token: authToken } = res.data;

      setUser(loggedInUser);
      setToken(authToken);

      if (typeof window !== "undefined") {
        localStorage.setItem("rawasin_token", authToken);
        localStorage.setItem("rawasin_user", JSON.stringify(loggedInUser));
      }

      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout API call encountered an error:", err);
    } finally {
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("rawasin_token");
        localStorage.removeItem("rawasin_user");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
