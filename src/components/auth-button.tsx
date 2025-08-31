"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { Wallet, FileText, Loader2 } from "lucide-react";

export function AuthButton() {
  const { isAuthenticated, login, error, isLoading } = useAuth();
  const { isConnected } = useAccount();

  const handleSignIn = async () => {
    try {
      await login();
    } catch (err) {
      // Error is handled by auth context
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
              className="w-full justify-start gap-2"
              onClick={show}
              disabled={isLoading}
            >
              <Wallet className="h-4 w-4" />
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </ConnectKitButton.Custom>
      ) : (
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Sign in with Ethereum
            </>
          )}
        </Button>
      )}
      {error && (
        <div className="space-y-1">
          <p className="text-xs text-destructive px-2">{error}</p>
          {isConnected && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-6"
              onClick={handleSignIn}
            >
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}