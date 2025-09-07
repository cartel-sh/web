"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cartel } from "@/lib/cartel-client";
import { isAddress } from "viem";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wallet, Shield, Users, CheckCircle, Loader2 } from "lucide-react";
import { useSafeImport } from "@/hooks/useSafeImport";
import { getChainDisplayName } from "@/lib/safe-service";

interface AddTreasuryDialogProps {
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTreasuryAdded: () => void;
}

interface TreasuryFormData {
  address: string;
  name: string;
  purpose: string;
  role: string;
  description: string;
  chain: string;
  type: string;
  threshold?: number;
  owners?: string[];
  chainIds?: number[];
  metadata?: {
    version?: string;
    modules?: string[];
    guard?: string;
    fallbackHandler?: string;
    nonce?: number;
    chainData?: {
      [chainId: number]: {
        nonce?: number;
        version?: string;
        masterCopy?: string;
      };
    };
  };
}

export function AddTreasuryDialog({ projectId, isOpen, onOpenChange, onTreasuryAdded }: AddTreasuryDialogProps) {
  const [formData, setFormData] = useState<TreasuryFormData>({
    address: "",
    name: "",
    purpose: "",
    role: "primary",
    description: "",
    chain: "mainnet",
    type: "safe",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importAddress, setImportAddress] = useState("");
  
  const safeImport = useSafeImport();

  const handleSafeImport = async () => {
    if (!importAddress.trim()) {
      setError("Please enter a Safe address");
      return;
    }

    try {
      setError(null);
      
      // First validate the address
      const validation = await safeImport.validateAddress(importAddress);
      
      if (!validation.exists) {
        setError(validation.error || "Safe not found on supported networks");
        return;
      }

      // Import the Safe info
      const safeInfo = await safeImport.importSafe(importAddress, validation.chainId);
      
      // Auto-populate the form with Safe data
      setFormData({
        address: safeInfo.address,
        name: safeImport.generateName(safeInfo),
        purpose: "", // User can still fill this
        role: "primary",
        description: "", // User can still fill this  
        chain: safeInfo.chainId.toString(),
        type: "safe",
        threshold: safeInfo.threshold,
        owners: safeInfo.owners,
        metadata: {
          version: safeInfo.version,
          modules: safeInfo.modules,
          guard: safeInfo.guard,
          fallbackHandler: safeInfo.fallbackHandler,
          nonce: safeInfo.nonce,
          chainData: safeInfo.chainData
        },
        // Store all chains where Safe exists
        chainIds: safeInfo.chainIds || [safeInfo.chainId]
      });

      // Load balance info (non-blocking)
      safeImport.loadBalance(safeInfo.address, safeInfo.chainId);
      
      // Form is now populated, user can review/edit
      
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to import Safe");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.address || !formData.name) {
      setError("Address and name are required");
      return;
    }

    if (!isAddress(formData.address)) {
      setError("Invalid Ethereum address");
      return;
    }

    try {
      setIsLoading(true);
      
      const submitData: any = {
        address: formData.address,
        name: formData.name,
        purpose: formData.purpose || undefined,
        chainIds: formData.chainIds || [parseInt(formData.chain)],
        type: formData.type,
        role: formData.role,
        description: formData.description || undefined,
      };

      if (formData.type === "safe" && formData.threshold && formData.owners) {
        submitData.threshold = formData.threshold;
        submitData.owners = formData.owners;
        
        if (formData.metadata) {
          submitData.metadata = formData.metadata;
        }
      }

      await cartel.treasuries.addProjectTreasury(projectId, submitData);

      // Reset everything
      resetForm();
      safeImport.reset();
      onTreasuryAdded();
    } catch (error) {
      console.error("Failed to add treasury:", error);
      setError(error instanceof Error ? error.message : "Failed to add treasury");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      address: "",
      name: "",
      purpose: "",
      role: "primary",
      description: "",
      chain: "1",
      type: "safe",
    });
    setImportAddress("");
  };

  const handleClose = () => {
    resetForm();
    safeImport.reset();
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Add Treasury
          </DialogTitle>
          <DialogDescription>
            Import a Safe treasury automatically or add any wallet manually. 
            This enables treasury data tracking and DAO governance features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Treasury Address Input */}
          {!safeImport.safeInfo && (
            <div className="space-y-2">
              <Label htmlFor="import-address">Treasury Address</Label>
              <div className="flex gap-2">
                <Input
                  id="import-address"
                  value={importAddress}
                  onChange={(e) => setImportAddress(e.target.value)}
                  placeholder="0x1234...abcd"
                  disabled={safeImport.isValidating || safeImport.isLoading}
                />
                <Button
                  type="button"
                  onClick={handleSafeImport}
                  disabled={!importAddress.trim() || safeImport.isValidating || safeImport.isLoading}
                >
                  {safeImport.isValidating || safeImport.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Import Safe"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a Safe address to automatically import its configuration and owners
              </p>
            </div>
          )}

          {/* Safe Info and Form */}
          {safeImport.safeInfo && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Safe Configuration Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Safe Found
                  </CardTitle>
                  <CardDescription>
                    {safeImport.safeInfo.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {safeImport.safeInfo.chainIds && safeImport.safeInfo.chainIds.length > 1 ? (
                      safeImport.safeInfo.chainIds.map(chainId => (
                        <Badge key={chainId} variant="secondary" className="text-xs">
                          {getChainDisplayName(chainId)}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">
                        {getChainDisplayName(safeImport.safeInfo.chainId)}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      v{safeImport.safeInfo.version}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        Threshold
                      </div>
                      <div className="font-semibold">
                        {safeImport.safeInfo.threshold} of {safeImport.safeInfo.owners.length}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        Owners
                      </div>
                      <div className="font-semibold">
                        {safeImport.safeInfo.owners.length}
                      </div>
                    </div>
                  </div>

                  {safeImport.safeInfo.chainIds && safeImport.safeInfo.chainIds.length > 1 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Multi-chain Safe: </span>
                      <span className="font-medium">
                        Found on {safeImport.safeInfo.chainIds.length} networks
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Editable Form Fields */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Treasury Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Main Treasury"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    A descriptive name for this treasury
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="Development funding"
                  />
                  <p className="text-xs text-muted-foreground">
                    What is this treasury used for?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role in Project</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="funding">Funding</SelectItem>
                        <SelectItem value="governance">Governance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="description">Project-specific Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="How does this treasury relate to this specific project?"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional description of how this treasury is used for this specific project
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    safeImport.reset();
                    resetForm();
                  }}
                >
                  Start Over
                </Button>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !formData.name}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Treasury"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}