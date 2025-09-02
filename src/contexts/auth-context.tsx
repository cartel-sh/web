"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAccount, useSignMessage, useConnect, useDisconnect } from "wagmi";
import { SiweMessage } from "siwe";
import { cartel } from "@/lib/cartel-client";
import { LocalStorageTokenStorage } from "@cartel-sh/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    userId: string;
    address: string;
    role: string;
    ensName?: string | null;
    ensAvatar?: string | null;
  } | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ 
    userId: string; 
    address: string;
    role: string;
    ensName?: string | null;
    ensAvatar?: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedAutoLogin, setHasTriedAutoLogin] = useState(false);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { connectAsync } = useConnect();
  const { disconnect } = useDisconnect();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to get current user via SDK
        const userData = await cartel.auth.me();
        if (userData) {
          setUser({
            userId: userData.userId,
            address: userData.address || '',
            role: userData.user?.role || 'authenticated',
            ensName: userData.user?.ensName,
            ensAvatar: userData.user?.ensAvatar,
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Not authenticated or error - user needs to login
        setIsAuthenticated(false);
      }
    };
    checkSession();
  }, []);

  // Reset auto-login flag when wallet disconnects or changes
  useEffect(() => {
    if (!isConnected || !address) {
      setHasTriedAutoLogin(false);
      setError(null); // Clear any previous errors when wallet disconnects
    }
  }, [isConnected, address]);

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Ensure wallet is connected
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      const walletAddress = address;

      // Request server-generated nonce for security
      const nonceResponse = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: walletAddress }),
      });

      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce');
      }

      const { nonce } = await nonceResponse.json();

      const domain = window.location.host;
      const origin = window.location.origin;

      const siweMessage = new SiweMessage({
        domain,
        address: walletAddress,
        statement: "Sign in to Cartel",
        uri: origin,
        version: "1",
        chainId: 1,
        nonce,
      });

      const message = siweMessage.prepareMessage();

      // Sign the message with wallet
      const signature = await signMessageAsync({ message });

      // Verify with our API route first to validate nonce
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || 'Verification failed');
      }

      const response = await verifyResponse.json();

      if (response.accessToken && response.refreshToken) {
        const tokenStorage = new LocalStorageTokenStorage();
        tokenStorage.setTokens(response.accessToken, response.refreshToken, response.expiresIn);
      }

      const userData = await cartel.auth.me();
      setUser({
        userId: response.userId,
        address: response.address,
        role: userData?.user?.role || 'authenticated',
        ensName: userData?.user?.ensName,
        ensAvatar: userData?.user?.ensAvatar,
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to authenticate");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, connectAsync, signMessageAsync]);

  // Auto-trigger SIWE when wallet connects and user is not authenticated
  useEffect(() => {
    const attemptAutoLogin = async () => {
      // Only attempt if:
      // - Wallet is connected
      // - User is not already authenticated
      // - We have an address
      // - We haven't tried auto login yet for this connection
      if (isConnected && address && !isAuthenticated && !hasTriedAutoLogin && !isLoading) {
        setHasTriedAutoLogin(true);
        try {
          await login();
        } catch (error) {
          // Auto-login failed, user can manually retry
          console.log("Auto-login after wallet connection failed:", error);
        }
      }
    };

    attemptAutoLogin();
  }, [isConnected, address, isAuthenticated, hasTriedAutoLogin, isLoading, login]);

  const logout = useCallback(async () => {
    try {
      // Revoke tokens on server and clear local storage
      await cartel.auth.revoke();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if revoke fails, clear local tokens
      cartel.auth.logout();
    }

    // Clear local state
    setUser(null);
    setIsAuthenticated(false);
    disconnect();
  }, [disconnect]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}