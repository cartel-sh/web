"use client";

import { Button } from "@/components/ui/button";
import { User, LogOut, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";

export function UserMenu() {
  const { isAuthenticated, isLoading, user, login, logout, error } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLogin = async () => {
    setIsConnecting(true);
    try {
      await login();
    } catch (err) {
      // Error is handled in the auth context
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg border bg-background/50">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <User className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{formatAddress(user.address)}</p>
          <p className="text-xs text-muted-foreground truncate">Connected</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={handleLogout}
          title="Disconnect"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button 
        variant="outline" 
        size="sm"
        className="w-full justify-start gap-2"
        onClick={handleLogin}
        disabled={isLoading || isConnecting}
      >
        <Wallet className="h-4 w-4" />
        {isLoading || isConnecting ? "Connecting..." : "Sign in with Ethereum"}
      </Button>
      {error && (
        <p className="text-xs text-destructive px-2">{error}</p>
      )}
    </div>
  );
}