"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Wallet, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ConnectKitButton } from "connectkit";
import { useState } from "react";
import Link from "next/link";

export function UserMenu() {
  const { isAuthenticated, isLoading, user, logout, error } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDisplayName = () => {
    if (isLoading) return "Loading...";
    return user?.ensName || formatAddress(user?.address || "");
  };

  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            {user.ensAvatar ? (
              <img 
                src={user.ensAvatar} 
                alt="ENS Avatar" 
                className="h-4 w-4 rounded-full"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span className="text-sm font-medium truncate">
              {getDisplayName()}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/dash" className="flex items-center gap-2 cursor-pointer">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Use the separate AuthButton component for unauthenticated state
  return null;
}