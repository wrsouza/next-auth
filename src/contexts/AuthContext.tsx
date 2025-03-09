"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { ServiceFactory } from "@/services/factory";
import { AuthResponse } from "@/services/interfaces";
import { initializeServices } from "@/services/initialize";

// Initialize services
initializeServices();

interface AuthContextState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthContextActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: (token: string) => Promise<AuthResponse>;
  clearError: () => void;
}

interface AuthContextType extends AuthContextState, AuthContextActions {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  const router = useRouter();
  const authService = useMemo(() => ServiceFactory.getAuthService(), []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const handleTokenRefresh = useCallback(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const userData = await authService.checkAuth(handleTokenRefresh);
      setState((prev) => ({
        ...prev,
        user: userData,
        error: null,
        isAuthenticated: true,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        user: null,
        error: err instanceof Error ? err.message : "Authentication failed",
        isAuthenticated: false,
        loading: false,
      }));
    }
  }, [authService, handleTokenRefresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        await authService.login(email, password);
        await checkAuth();
        router.push("/dashboard");
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Login failed",
          loading: false,
        }));
      }
    },
    [authService, checkAuth, router]
  );

  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      authService.logout();
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
      router.push("/login");
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Logout failed",
        loading: false,
      }));
    }
  }, [authService, router]);

  const refreshToken = useCallback(
    async (token: string) => {
      return authService.refreshToken(token);
    },
    [authService]
  );

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    return () => {
      authService.logout();
    };
  }, [authService, checkAuth]);

  const contextValue = useMemo(
    () => ({
      ...state,
      login,
      logout,
      checkAuth,
      refreshToken,
      clearError,
    }),
    [state, login, logout, checkAuth, refreshToken, clearError]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
