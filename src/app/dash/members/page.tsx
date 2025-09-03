"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cartel } from "@/lib/cartel-client";
import type { User } from "@cartel-sh/api";
import { Users, Crown, UserCheck, AlertCircle, ShieldUser } from "lucide-react";

interface MemberResponse {
  id: string;
  role: "authenticated" | "member" | "admin";
  address: string | null;
  ensName: string | null;
  ensAvatar: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export default function MembersPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Only load members if current user is member or admin
      if (user.role === "member" || user.role === "admin") {
        loadMembers();
      }
    }
  }, [isAuthenticated, user]);

  const loadMembers = async () => {
    try {
      setIsLoadingMembers(true);
      setError(null);
      // Get all members and admins
      const membersData = await cartel.users.getMembers({
        limit: 100,
        includeIdentities: false,
      });
      setMembers(membersData.members as MemberResponse[]);
    } catch (error) {
      console.error("Failed to load members:", error);
      setError(error instanceof Error ? error.message : "Failed to load members");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to home
  }

  // Check if user has permission to view members
  if (user.role === "authenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You need to be a member or admin to view the member list.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const adminCount = members.filter(m => m.role === "admin").length;
  const memberCount = members.filter(m => m.role === "member").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Cartel members and administrators</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cartel Members</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberCount + adminCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff</CardTitle>
              <ShieldUser className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Member Directory</CardTitle>
            <CardDescription>
              All cartel members and administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/15 border border-destructive/20 rounded-md p-3 text-sm text-destructive mb-4">
                {error}
              </div>
            )}

            {isLoadingMembers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No members found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                        {member.ensAvatar ? (
                          <img
                            src={member.ensAvatar}
                            alt="Member avatar"
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {member.ensName || member.address || `User ${member.id.slice(0, 8)}`}
                          </h3>
                          {member.role === "admin" && (
                            <Badge variant="default" className="text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {member.role === "member" && (
                            <Badge variant="secondary" className="text-xs">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Member
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(member.createdAt || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.ensName && (
                        <Badge variant="outline" className="text-xs">
                          ENS
                        </Badge>
                      )}
                      {member.address && (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {member.address.slice(0, 6)}...{member.address.slice(-4)}
                        </code>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}