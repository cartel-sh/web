"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAccount, useSignMessage, useConnect, useDisconnect } from "wagmi";
import { SiweMessage } from "siwe";
import { injected } from "wagmi/connectors";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    userId: string;
    address: string;
  } | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ userId: string; address: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { connectAsync } = useConnect();
  const { disconnect } = useDisconnect();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to get current user via our API route
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser({
            userId: userData.userId,
            address: userData.address,
          });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Not authenticated or error - user needs to login
        setIsAuthenticated(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Connect wallet if not connected
      let walletAddress = address;
      if (!isConnected) {
        const result = await connectAsync({ connector: injected() });
        walletAddress = result.accounts[0];
      }

      if (!walletAddress) {
        throw new Error("No wallet address available");
      }

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

      // Verify with our API route (which will use the server-side API key)
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || 'Verification failed');
      }

      const response = await verifyResponse.json();

      // Update state with user info
      setUser({
        userId: response.userId,
        address: response.address,
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

  const logout = useCallback(async () => {
    try {
      // Call our API route to logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error("Logout error:", error);
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