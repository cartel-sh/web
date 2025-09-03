"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectAccountButtonProps {
  platform: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function ConnectAccountButton({
  platform,
  icon,
  label,
  onClick,
  disabled = false,
  className,
}: ConnectAccountButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className={cn(
        "justify-start",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="mr-2">{icon}</span>
      {disabled ? `${platform.charAt(0).toUpperCase() + platform.slice(1)} Connected` : label}
    </Button>
  );
}