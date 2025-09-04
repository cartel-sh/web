"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check,
  MoreVertical,
  Unlink,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserIdentity {
  userId: string;
  platform: string;
  identity: string;
  isPrimary: boolean;
  metadata: {
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    email?: string;
    bio?: string;
    profileUrl?: string;
  } | null;
  verifiedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface AccountRowProps {
  platformName: string;
  platformIcon: React.ReactNode;
  identity: UserIdentity | null;
  onConnect: () => void;
  onDisconnect: (platform: string, identity: string) => void;
}

export function AccountRow({
  platformName,
  platformIcon,
  identity,
  onConnect,
  onDisconnect
}: AccountRowProps) {
  const formatIdentity = (identity: UserIdentity) => {
    if (identity.metadata?.username) {
      return identity.metadata.username;
    }
    
    if (identity.platform === "evm") {
      return `${identity.identity.slice(0, 6)}...${identity.identity.slice(-4)}`;
    }
    
    return identity.identity;
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0">
          {platformIcon}
        </div>
        
        <div className="flex-1">
          {identity ? (
            <div className="flex items-center gap-2">
              {identity.metadata?.avatarUrl && (
                <img 
                  src={identity.metadata.avatarUrl} 
                  alt={identity.metadata.displayName || identity.identity}
                  className="h-5 w-5 rounded-full object-cover flex-shrink-0"
                />
              )}
              <p className="font-medium">
                {formatIdentity(identity)}
              </p>
              {identity.verifiedAt && (
                <Badge variant="outline" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          ) : (
            <p className="font-medium text-muted-foreground">{platformName}</p>
          )}
          <span className="text-sm text-muted-foreground">
            {identity ? "Connected" : "Not connected"}
          </span>
        </div>
      </div>

      {identity ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {identity.metadata?.profileUrl && (
              <>
                <DropdownMenuItem asChild>
                  <a href={identity.metadata.profileUrl} target="_blank" rel="noopener noreferrer">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </a>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem 
              onClick={() => onDisconnect(identity.platform, identity.identity)}
            >
              <Unlink className="h-4 w-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={onConnect} variant="outline" size="sm">
          Connect
        </Button>
      )}
    </div>
  );
}