"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cartel } from "@/lib/cartel-client";
import type { ProjectWithUser } from "@cartel-sh/api";
import { ExternalLink, Github, Crown, UserCheck, User, ShieldUser } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Dashboard() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithUser[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      setError(null);
      // Get all public projects for the dashboard
      const projectsData = await cartel.projects.list({
        public: "true",
        limit: 50,
      });
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to load projects:", error);
      setError(error instanceof Error ? error.message : "Failed to load projects");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const shouldLimitProjectsHeight = projects.length > 5;

  if (!isAuthenticated || !user) {
    return null; // Will redirect to home
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back{user.ensName ? `, ${user.ensName}` : ''}</h1>
            <p className="text-muted-foreground">Manage your cartel membership and projects</p>
          </div>
          {user && (user.role === 'member' || user.role === 'admin') && (
            <div className="flex items-center gap-2 flex-col">
              {user.role === 'admin' ? (
                <div className="flex items-center gap-2">
                  <ShieldUser className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold text-primary">Staff</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold text-primary">Member</span>
                </div>
              )}
              <span className="text-muted-foreground">of the cartel</span>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Community Projects</CardTitle>
                <CardDescription>All public projects in Cartel</CardDescription>
              </div>
              <Button asChild>
                <Link href="/dash/projects">My Projects</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/15 border border-destructive/20 rounded-md p-3 text-sm text-destructive mb-4">
                {error}
              </div>
            )}

            {isLoadingProjects ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No public projects yet</p>
              </div>
            ) : (
              <ScrollArea className={`pr-4 ${shouldLimitProjectsHeight ? "h-[60vh]" : "max-h-[60vh]"}`}>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{project.title}</h3>
                          {!project.isPublic && (
                            <Badge variant="secondary" className="text-xs">Private</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {project.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          {project.tags && project.tags.length > 0 && (
                            <div className="flex gap-1">
                              {project.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {project.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {project.user && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {project.user.ensAvatar && (
                              <img
                                src={project.user.ensAvatar}
                                alt="Creator avatar"
                                className="w-4 h-4 rounded-full"
                              />
                            )}
                            <span>
                              {project.user.ensName || project.user.id}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {project.githubUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {project.deploymentUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.deploymentUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
