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
import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

export function UserMenu() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState(0);

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
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            ref={buttonRef}
            variant="outline" 
            className="h-10 px-3 w-full justify-start gap-2"
            onMouseEnter={() => {
              if (buttonRef.current) {
                setButtonWidth(buttonRef.current.offsetWidth);
              }
            }}
          >
            {user.ensAvatar ? (
              <img 
                src={user.ensAvatar} 
                alt="ENS Avatar" 
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
            <span className="text-sm font-medium truncate">
              {getDisplayName()}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <AnimatePresence>
          {isOpen && (
            <DropdownMenuContent asChild forceMount align="end" sideOffset={4}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ 
                  duration: 0.2,
                  ease: [0.16, 1, 0.3, 1]
                }}
                style={{ width: buttonWidth || 'auto' }}
                className="min-w-[180px]"
              >
                <DropdownMenuItem asChild>
                  <Link href="/dash" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          )}
        </AnimatePresence>
      </DropdownMenu>
    );
  }

  // Use the separate AuthButton component for unauthenticated state
  return null;
}