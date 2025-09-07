"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, ExternalLink, Shield, Users, DollarSign, Trash2, AlertCircle, Copy, RefreshCw } from "lucide-react";
import { cartel } from "@/lib/cartel-client";
import type { Treasury, ProjectTreasury } from "@cartel-sh/api";
import { formatUnits } from "viem";
import { fetchSafeInfo, getSafeBalance, getChainDisplayName, type SafeInfo, type SafeBalance } from "@/lib/safe-service";

interface TreasuryCardProps {
  projectTreasury: ProjectTreasury & { treasury?: Treasury };
  onRemove: () => void;
  projectId: string;
}

export function TreasuryCard({ projectTreasury, onRemove, projectId }: TreasuryCardProps) {
  const [safeInfo, setSafeInfo] = useState<SafeInfo | null>(null);
  const [balance, setBalance] = useState<SafeBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);

  const treasury = projectTreasury.treasury;

  useEffect(() => {
    if (treasury && treasury.type === 'safe') {
      loadSafeInfo();
    } else if (treasury) {
      if (treasury.threshold && treasury.owners) {
        // Use chainIds if available, fallback to primary chainId
        const primaryChainId = (treasury as any).chainIds?.[0] || parseInt((treasury as any).chain || '1');
        setSafeInfo({
          address: treasury.address,
          threshold: treasury.threshold,
          owners: treasury.owners,
          nonce: treasury.metadata?.nonce || 0,
          version: treasury.metadata?.version || "1.3.0",
          modules: treasury.metadata?.modules || [],
          guard: treasury.metadata?.guard,
          fallbackHandler: treasury.metadata?.fallbackHandler,
          chainId: primaryChainId,
          chainIds: (treasury as any).chainIds || [primaryChainId],
          chainData: treasury.metadata?.chainData
        });
      }
    }
  }, [treasury]);


  const loadSafeInfo = async () => {
    if (!treasury) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch real Safe info from the blockchain  
      const primaryChainId = (treasury as any).chainIds?.[0] || parseInt((treasury as any).chain || '1');
      const realSafeInfo = await fetchSafeInfo(treasury.address, primaryChainId);
      setSafeInfo(realSafeInfo);
      
      // Load balance separately (non-blocking)
      loadBalance();

    } catch (error) {
      console.error("Failed to load real Safe info:", error);
      setError("Using cached data - unable to fetch latest Safe info");
      
      // Always fallback to stored metadata if available
      if (treasury.threshold && treasury.owners) {
        const primaryChainId = (treasury as any).chainIds?.[0] || parseInt((treasury as any).chain || '1');
        setSafeInfo({
          address: treasury.address,
          threshold: treasury.threshold,
          owners: treasury.owners,
          nonce: treasury.metadata?.nonce || 0,
          version: treasury.metadata?.version || "1.3.0",
          modules: treasury.metadata?.modules || [],
          guard: treasury.metadata?.guard,
          fallbackHandler: treasury.metadata?.fallbackHandler,
          chainId: primaryChainId,
          chainIds: (treasury as any).chainIds || [primaryChainId],
          chainData: treasury.metadata?.chainData
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadBalance = async (chainId?: number) => {
    if (!treasury) return;
    
    // Use provided chainId, selectedChainId, or default chain
    const targetChainId = chainId || selectedChainId || (treasury as any).chainIds?.[0] || parseInt((treasury as any).chain || '1');
    
    try {
      setIsLoadingBalance(true);
      const realBalance = await getSafeBalance(treasury.address, targetChainId);
      setBalance(realBalance);
    } catch (error) {
      console.error("Failed to load Safe balance:", error);
      // Don't show error for balance loading failure - just use empty balance
      setBalance({ total: BigInt(0), tokens: [] });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const refreshData = async () => {
    if (treasury?.type === 'safe') {
      await loadSafeInfo();
    } else if (treasury) {
      await loadBalance();
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

  const getChainExplorerUrl = (address: string, chainId: number) => {
    const explorers: Record<number, string> = {
      1: "https://etherscan.io/address/",
      137: "https://polygonscan.com/address/",
      42161: "https://arbiscan.io/address/",
      10: "https://optimistic.etherscan.io/address/",
      8453: "https://basescan.org/address/",
      56: "https://bscscan.com/address/",
      100: "https://gnosisscan.io/address/",
      43114: "https://snowtrace.io/address/",
      42220: "https://celoscan.io/address/",
      11155111: "https://sepolia.etherscan.io/address/",
    };
    return (explorers[chainId] || explorers[1]) + address;
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
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {projectTreasury.role}
            </Badge>
            {/* Show all chains if multi-chain, otherwise show single chain */}
            {safeInfo?.chainIds && safeInfo.chainIds.length > 1 ? (
              safeInfo.chainIds.map((chainId: number) => (
                <Badge key={chainId} variant="outline" className="text-xs">
                  {getChainDisplayName(chainId)}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="text-xs">
                {(() => {
                  const chainId = (treasury as any).chainIds?.[0] || parseInt((treasury as any).chain || '1');
                  return !isNaN(chainId) ? getChainDisplayName(chainId) : 'Unknown Chain';
                })()}
              </Badge>
            )}
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
              {treasury.type === 'safe' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshData}
                  disabled={isLoading || isLoadingBalance}
                  className="h-6 px-2"
                >
                  <RefreshCw className={`h-3 w-3 ${(isLoading || isLoadingBalance) ? 'animate-spin' : ''}`} />
                </Button>
              )}
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
                  href={getChainExplorerUrl(treasury.address, (treasury as any).chainIds?.[0] || parseInt((treasury as any).chain || '1'))}
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
          <div className="space-y-3">
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

            {/* Multi-chain info */}
            {safeInfo.chainIds && safeInfo.chainIds.length > 1 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Multi-Chain Deployment</div>
                <div className="flex flex-wrap gap-1">
                  {safeInfo.chainIds.map(chainId => (
                    <Badge key={chainId} variant="secondary" className="text-xs">
                      {getChainDisplayName(chainId)}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Same Safe deployed on {safeInfo.chainIds.length} networks
                </div>
              </div>
            )}
          </div>
        )}

        {/* Balance Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Balance
            </div>
            {/* Chain selector for multi-chain Safes */}
            {safeInfo?.chainIds && safeInfo.chainIds.length > 1 && (
              <Select
                value={selectedChainId?.toString() || safeInfo.chainId.toString()}
                onValueChange={(value) => {
                  const chainId = parseInt(value);
                  setSelectedChainId(chainId);
                  loadBalance(chainId);
                }}
              >
                <SelectTrigger className="w-32 h-6 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {safeInfo.chainIds.map(chainId => (
                    <SelectItem key={chainId} value={chainId.toString()}>
                      {getChainDisplayName(chainId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {isLoadingBalance ? (
            <div className="text-sm text-muted-foreground">Loading balance...</div>
          ) : balance && balance.tokens.length > 0 ? (
            <div className="space-y-1">
              {balance.tokens.map((token, index) => (
                <div key={`${token.symbol}-${token.tokenAddress || 'native'}-${index}`} className="flex items-center justify-between">
                  <span className="text-sm">{token.symbol}</span>
                  <div className="text-right">
                    <div className="font-mono text-sm">
                      {formatUnits(token.balance, token.decimals)} {token.symbol}
                    </div>
                    {token.usdValue && token.usdValue > 0 && (
                      <div className="text-xs text-muted-foreground">
                        ${token.usdValue.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {treasury?.type === 'safe' ? "No balance data available" : "Balance data not available for this treasury type"}
            </div>
          )}
        </div>

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