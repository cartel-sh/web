"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, 
  Star, 
  Unlink, 
  Check,
  User,
  GitBranch,
  MessageSquare,
  Wallet,
  AtSign,
  Send
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

interface IdentityListProps {
  identities: UserIdentity[];
  onDisconnect: (platform: string, identity: string) => void;
  onSetPrimary: (platform: string, identity: string) => void;
}

export function IdentityList({ identities, onDisconnect, onSetPrimary }: IdentityListProps) {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "github":
        return <GitBranch className="h-4 w-4" />;
      case "discord":
        return <MessageSquare className="h-4 w-4" />;
      case "evm":
        return <Wallet className="h-4 w-4" />;
      case "lens":
        return <AtSign className="h-4 w-4" />;
      case "farcaster":
        return <AtSign className="h-4 w-4" />;
      case "telegram":
        return <Send className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "evm":
        return "Wallet";
      case "lens":
        return "Lens";
      case "farcaster":
        return "Farcaster";
      case "telegram":
        return "Telegram";
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  const formatIdentity = (platform: string, identity: string, metadata: UserIdentity["metadata"]) => {
    if (metadata?.username) {
      return metadata.username;
    }
    
    if (platform === "evm") {
      // Shorten wallet address
      return `${identity.slice(0, 6)}...${identity.slice(-4)}`;
    }
    
    return identity;
  };

  return (
    <div className="space-y-3">
      {identities.map((identity) => (
        <div
          key={`${identity.platform}-${identity.identity}`}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {identity.metadata?.avatarUrl ? (
                <img 
                  src={identity.metadata.avatarUrl} 
                  alt={identity.metadata.displayName || identity.identity}
                  className="h-full w-full object-cover"
                />
              ) : (
                getPlatformIcon(identity.platform)
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {formatIdentity(identity.platform, identity.identity, identity.metadata)}
                </p>
                {identity.isPrimary && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Primary
                  </Badge>
                )}
                {identity.verifiedAt && (
                  <Badge variant="outline" className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {getPlatformLabel(identity.platform)}
                </span>
                {identity.metadata?.email && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {identity.metadata.email}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!identity.isPrimary && (
                <>
                  <DropdownMenuItem onClick={() => onSetPrimary(identity.platform, identity.identity)}>
                    <Star className="h-4 w-4 mr-2" />
                    Set as Primary
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {identity.metadata?.profileUrl && (
                <>
                  <DropdownMenuItem asChild>
                    <a href={identity.metadata.profileUrl} target="_blank" rel="noopener noreferrer">
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {!identity.isPrimary && (
                <DropdownMenuItem 
                  onClick={() => onDisconnect(identity.platform, identity.identity)}
                  className="text-destructive"
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}