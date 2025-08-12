"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, errorMessage, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-none px-3 py-2 text-sm",
            "bg-background border-0 border-b transition-colors duration-200",
            "placeholder:text-muted-foreground placeholder:opacity-30",
            "focus-visible:outline-none focus:border-b-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-b-destructive text-destructive-foreground"
              : "border-b-foreground/30 hover:border-b-foreground/50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && errorMessage && (
          <p className="mt-1 text-xs text-destructive">{errorMessage}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };