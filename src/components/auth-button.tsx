"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useState } from "react";
import { Wallet, FileText } from "lucide-react";

export function AuthButton() {
  const { isAuthenticated, login, error } = useAuth();
  const { isConnected } = useAccount();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await login();
    } catch (err) {
      // Error is handled by auth context
    } finally {
      setIsSigningIn(false);
    }
  };

  // If authenticated, don't show anything (UserMenu handles this)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-2">
      {!isConnected ? (
        <ConnectKitButton.Custom>
          {({ isConnected, show }) => (
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start gap-2"
              onClick={show}
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </ConnectKitButton.Custom>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleSignIn}
          disabled={isSigningIn}
        >
          <FileText className="h-4 w-4" />
          {isSigningIn ? "Signing..." : "Sign in with Ethereum"}
        </Button>
      )}
      {error && (
        <p className="text-xs text-destructive px-2">{error}</p>
      )}
    </div>
  );
}