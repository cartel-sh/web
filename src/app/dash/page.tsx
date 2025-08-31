"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useEnsName } from "@/hooks/use-ens";

export default function Dashboard() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { ensName } = useEnsName(user?.address);
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back{ensName ? `, ${ensName}` : ''}</h1>
          <p className="text-muted-foreground">Manage your cartel membership and projects</p>
        </div>

        {/* Projects Section */}
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Manage your cartel projects and contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <p>No projects yet</p>
              <Button variant="outline" className="mt-4">Create Project</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}