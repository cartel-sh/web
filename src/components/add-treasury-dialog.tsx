"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cartel } from "@/lib/cartel-client";
import { isAddress } from "viem";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wallet } from "lucide-react";

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
      await cartel.treasuries.addProjectTreasury(projectId, {
        address: formData.address,
        name: formData.name,
        purpose: formData.purpose || undefined,
        chain: formData.chain,
        type: formData.type,
        role: formData.role,
        description: formData.description || undefined,
      });

      // Reset form
      setFormData({
        address: "",
        name: "",
        purpose: "",
        role: "primary",
        description: "",
        chain: "mainnet",
        type: "safe",
      });

      onTreasuryAdded();
    } catch (error) {
      console.error("Failed to add treasury:", error);
      setError(error instanceof Error ? error.message : "Failed to add treasury");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      address: "",
      name: "",
      purpose: "",
      role: "primary",
      description: "",
      chain: "mainnet",
      type: "safe",
    });
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Add Treasury
          </DialogTitle>
          <DialogDescription>
            Connect a Safe treasury or other multisig wallet to this project. 
            This will enable treasury data tracking and DAO governance features.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Treasury Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="0x1234...abcd"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the Ethereum address of your Safe or multisig wallet
              </p>
            </div>

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

              <div className="space-y-2">
                <Label htmlFor="chain">Blockchain</Label>
                <Select 
                  value={formData.chain} 
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, chain: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mainnet">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    <SelectItem value="optimism">Optimism</SelectItem>
                    <SelectItem value="base">Base</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Treasury Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safe">Safe (Gnosis Safe)</SelectItem>
                  <SelectItem value="multisig">Other Multisig</SelectItem>
                  <SelectItem value="eoa">EOA (Single Wallet)</SelectItem>
                </SelectContent>
              </Select>
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

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Treasury"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}