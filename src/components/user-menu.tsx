"use client";

import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function UserMenu() {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border bg-background/50">
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <User className="h-4 w-4" />
      </Button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">Guest</p>
        <p className="text-xs text-muted-foreground truncate">Not connected</p>
      </div>
    </div>
  );
}