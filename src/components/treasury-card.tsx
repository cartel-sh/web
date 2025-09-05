"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, ExternalLink, Shield, Users, DollarSign, Trash2, AlertCircle, Copy } from "lucide-react";
import { cartel } from "@/lib/cartel-client";
import type { Treasury, ProjectTreasury } from "@cartel-sh/api";
import { formatUnits } from "viem";

interface TreasuryCardProps {
  projectTreasury: ProjectTreasury & { treasury?: Treasury };
  onRemove: () => void;
  projectId: string;
}

interface SafeInfo {
  address: string;
  threshold: number;
  owners: string[];
  nonce: number;
  version: string;
}

interface TreasuryBalance {
  total: bigint;
  tokens: Array<{
    symbol: string;
    balance: bigint;
    decimals: number;
    usdValue?: number;
  }>;
}

export function TreasuryCard({ projectTreasury, onRemove, projectId }: TreasuryCardProps) {
  const [safeInfo, setSafeInfo] = useState<SafeInfo | null>(null);
  const [balance, setBalance] = useState<TreasuryBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const treasury = projectTreasury.treasury;

  useEffect(() => {
    if (treasury && treasury.type === 'safe') {
      loadSafeInfo();
    }
  }, [treasury]);

  const loadSafeInfo = async () => {
    if (!treasury) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Note: In a real implementation, you would initialize Safe with a proper RPC provider
      // For now, we'll simulate the Safe info based on stored metadata
      if (treasury.metadata) {
        setSafeInfo({
          address: treasury.address,
          threshold: treasury.threshold || 1,
          owners: treasury.owners || [],
          nonce: treasury.metadata.nonce || 0,
          version: treasury.metadata.version || "1.3.0",
        });
      }

      // Simulate balance loading (in reality, you'd fetch from the blockchain)
      setBalance({
        total: BigInt("1000000000000000000"), // 1 ETH in wei
        tokens: [
          {
            symbol: "ETH",
            balance: BigInt("1000000000000000000"),
            decimals: 18,
            usdValue: 2000,
          },
        ],
      });

    } catch (error) {
      console.error("Failed to load Safe info:", error);
      setError("Failed to load treasury information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!treasury) return;
    
    try {
      setIsRemoving(true);
      await cartel.treasuries.removeProjectTreasury(projectId, treasury.id);
      onRemove();
    } catch (error) {
      console.error("Failed to remove treasury:", error);
      setError("Failed to remove treasury");
    } finally {
      setIsRemoving(false);
    }
  };

  const copyAddress = async () => {
    if (treasury) {
      await navigator.clipboard.writeText(treasury.address);
    }
  };

  const getChainExplorerUrl = (address: string, chain: string) => {
    const explorers: Record<string, string> = {
      mainnet: "https://etherscan.io/address/",
      polygon: "https://polygonscan.com/address/",
      arbitrum: "https://arbiscan.io/address/",
      optimism: "https://optimistic.etherscan.io/address/",
      base: "https://basescan.org/address/",
    };
    return explorers[chain] + address;
  };

  if (!treasury) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            Treasury information not available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {treasury.name}
            </CardTitle>
            <CardDescription>
              {treasury.purpose || "No purpose specified"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {projectTreasury.role}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {treasury.chain}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {treasury.type}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Treasury Address */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Address</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-6 px-2"
              >
                <a
                  href={getChainExplorerUrl(treasury.address, treasury.chain)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
          <div className="font-mono text-sm bg-muted p-2 rounded">
            {treasury.address}
          </div>
        </div>

        {/* Safe Info */}
        {treasury.type === 'safe' && safeInfo && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Shield className="h-3 w-3" />
                Threshold
              </div>
              <div className="text-lg font-semibold">
                {safeInfo.threshold} of {safeInfo.owners.length}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                Owners
              </div>
              <div className="text-lg font-semibold">
                {safeInfo.owners.length}
              </div>
            </div>
          </div>
        )}

        {/* Balance Info */}
        {balance && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Balance
            </div>
            <div className="space-y-1">
              {balance.tokens.map((token, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{token.symbol}</span>
                  <div className="text-right">
                    <div className="font-mono text-sm">
                      {formatUnits(token.balance, token.decimals)} {token.symbol}
                    </div>
                    {token.usdValue && (
                      <div className="text-xs text-muted-foreground">
                        ${token.usdValue.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project-specific Description */}
        {projectTreasury.description && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Project Role</span>
            <p className="text-sm text-muted-foreground">
              {projectTreasury.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                Loading...
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {isRemoving ? "Removing..." : "Remove"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}