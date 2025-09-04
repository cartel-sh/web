"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { cartel } from "@/lib/cartel-client";
import { Card } from "@/components/ui/card";
import { User, Loader2 } from "lucide-react";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { AccountRow } from "@/components/account-row";

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

export default function AccountPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reassignDialog, setReassignDialog] = useState<{
    open: boolean;
    platform: string;
    identity: string;
    previousUserId?: string;
  }>({ open: false, platform: "", identity: "" });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchIdentities();
    }
  }, [isAuthenticated, user]);

  // Handle OAuth callback URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const reassigned = urlParams.get('reassigned');
    const platform = urlParams.get('platform');
    const error = urlParams.get('error');

    if (connected) {
      setSuccessMessage(`Successfully connected your ${connected.charAt(0).toUpperCase() + connected.slice(1)} account!`);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (reassigned && platform) {
      setReassignDialog({
        open: true,
        platform: platform,
        identity: "",
      });
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      const errorMessages: Record<string, string> = {
        missing_code: "OAuth authorization failed. Please try again.",
        token_exchange_failed: "Failed to authenticate with the service. Please try again.",
        oauth_error: "OAuth service returned an error. Please try again.",
        user_fetch_failed: "Failed to fetch your profile information. Please try again.",
        connection_failed: "Failed to connect your account. Please try again.",
        unexpected: "An unexpected error occurred. Please try again.",
      };
      setError(errorMessages[error] || "An error occurred during authentication.");
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchIdentities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await cartel.users.getMyIdentities();
      // Transform the data to match our UserIdentity interface
      const transformedData: UserIdentity[] = data.map((identity: any) => ({
        userId: identity.userId,
        platform: identity.platform,
        identity: identity.identity,
        isPrimary: identity.isPrimary,
        metadata: identity.metadata || null,
        verifiedAt: identity.verifiedAt || null,
        createdAt: identity.createdAt || null,
        updatedAt: identity.updatedAt || null,
      }));
      setIdentities(transformedData);
    } catch (error: any) {
      console.error("Failed to fetch identities:", error);
      setError("Failed to load your connected accounts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      // Initiate GitHub OAuth flow
      const redirectUri = `${window.location.origin}/api/auth/github/callback`;
      const clientId = "Ov23li1F1GdAUI3la94w";

      // Store state for CSRF protection and auth context
      const state = Math.random().toString(36).substring(7);
      sessionStorage.setItem("github_oauth_state", state);
      
      // Redirect to GitHub OAuth
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=read:user user:email`;
    } catch (error: any) {
      console.error("Failed to initiate GitHub OAuth:", error);
      setError("Failed to connect GitHub account. Please try again.");
    }
  };

  const handleConnectDiscord = async () => {
    try {
      // Initiate Discord OAuth flow
      const redirectUri = `${window.location.origin}/api/auth/discord/callback`;
      const clientId = "1412792170884235376";

      // Store state for CSRF protection and auth context
      const state = Math.random().toString(36).substring(7);
      sessionStorage.setItem("discord_oauth_state", state);
      
      // Redirect to Discord OAuth
      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify email connections&state=${state}`;
    } catch (error: any) {
      console.error("Failed to initiate Discord OAuth:", error);
      setError("Failed to connect Discord account. Please try again.");
    }
  };

  const handleDisconnect = async (platform: string, identity: string) => {
    try {
      await cartel.users.disconnectMyIdentity(platform, identity);
      await fetchIdentities();
    } catch (error: any) {
      console.error("Failed to disconnect identity:", error);
      setError(error.message || "Failed to disconnect account. Please try again.");
    }
  };


  const handleReassignConfirm = async () => {
    // The reassignment already happened on the backend when connecting
    // This dialog is just for confirmation
    setReassignDialog({ open: false, platform: "", identity: "" });
    await fetchIdentities();
  };


  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please connect your wallet to view and manage your account.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your connected accounts and authentication methods.</p>
        </div>

        {error && (
          <Card className="p-4 border-destructive bg-destructive/10">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {successMessage && (
          <Card className="p-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </Card>
        )}

        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Connected Accounts</h2>
            <p className="text-sm text-muted-foreground">
              Connect and manage your accounts to access Cartel from multiple platforms.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* GitHub Account */}
              <AccountRow
                platformName="GitHub"
                platformIcon={<FaGithub className="h-6 w-6" />}
                identity={identities.find(i => i.platform === "github") || null}
                onConnect={handleConnectGitHub}
                onDisconnect={handleDisconnect}
              />

              {/* Discord Account */}
              <AccountRow
                platformName="Discord"
                platformIcon={<FaDiscord className="h-6 w-6" />}
                identity={identities.find(i => i.platform === "discord") || null}
                onConnect={handleConnectDiscord}
                onDisconnect={handleDisconnect}
              />

              {/* Other connected accounts (EVM, Lens, etc.) */}
              {identities.filter(i => !['github', 'discord'].includes(i.platform)).map((identity) => {
                const getPlatformName = (platform: string) => {
                  switch (platform) {
                    case "evm": return "Wallet";
                    case "lens": return "Lens";
                    case "farcaster": return "Farcaster";
                    case "telegram": return "Telegram";
                    default: return platform.charAt(0).toUpperCase() + platform.slice(1);
                  }
                };

                return (
                  <AccountRow
                    key={`${identity.platform}-${identity.identity}`}
                    platformName={getPlatformName(identity.platform)}
                    platformIcon={<User className="h-6 w-6" />}
                    identity={identity}
                    onConnect={() => {}} // These platforms don't have connect handlers in this interface
                    onDisconnect={handleDisconnect}
                  />
                );
              })}

              {identities.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No connected accounts yet.</p>
                  <p className="text-sm text-muted-foreground">Connect your GitHub or Discord account to get started.</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Reassignment Dialog */}
        {reassignDialog.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold mb-2">Account Reassignment</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This {reassignDialog.platform} account was previously connected to another user. 
                It has been reassigned to your account. All related data has been transferred.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={handleReassignConfirm}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Understood
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}