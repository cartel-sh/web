"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { cartel } from "@/lib/cartel-client";
import type { ProjectWithUser, Treasury, ProjectTreasury } from "@cartel-sh/api";
import { ChevronLeft, ExternalLink, Github, Plus, Check, X, Wallet } from "lucide-react";
import { AddTreasuryDialog } from "@/components/add-treasury-dialog";
import { TreasuryCard } from "@/components/treasury-card";

interface ProjectDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ProjectFormData {
  title: string;
  description: string;
  githubUrl: string;
  deploymentUrl: string;
  tags: string;
  isPublic: boolean;
}

export default function ProjectDetailsPage({ params: paramsPromise }: ProjectDetailsPageProps) {
  const params = use(paramsPromise);
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<ProjectWithUser | null>(null);
  const [projectTreasuries, setProjectTreasuries] = useState<(ProjectTreasury & { treasury?: Treasury })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTreasuries, setIsLoadingTreasuries] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddTreasuryOpen, setIsAddTreasuryOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    githubUrl: "",
    deploymentUrl: "",
    tags: "",
    isPublic: true,
  });

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      loadProject();
    }
  }, [isAuthenticated, params.id]);

  useEffect(() => {
    if (project) {
      loadProjectTreasuries();
      // Populate form data when project loads
      setFormData({
        title: project.title,
        description: project.description,
        githubUrl: project.githubUrl || "",
        deploymentUrl: project.deploymentUrl || "",
        tags: project.tags?.join(", ") || "",
        isPublic: project.isPublic,
      });
    }
  }, [project]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projectData = await cartel.projects.get(params.id);
      setProject(projectData);
    } catch (error) {
      console.error("Failed to load project:", error);
      setError(error instanceof Error ? error.message : "Failed to load project");
      // If project not found, redirect back to projects
      if (error instanceof Error && error.message.includes("404")) {
        router.push("/dash/projects");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectTreasuries = async () => {
    if (!project) return;

    try {
      setIsLoadingTreasuries(true);
      const treasuries = await cartel.treasuries.listProjectTreasuries(project.id);
      setProjectTreasuries(treasuries);
    } catch (error) {
      console.error("Failed to load project treasuries:", error);
    } finally {
      setIsLoadingTreasuries(false);
    }
  };

  const handleTreasuryAdded = () => {
    loadProjectTreasuries();
    setIsAddTreasuryOpen(false);
  };

  const handleReset = () => {
    // Reset form data to original project data
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        githubUrl: project.githubUrl || "",
        deploymentUrl: project.deploymentUrl || "",
        tags: project.tags?.join(", ") || "",
        isPublic: project.isPublic,
      });
    }
    setError(null);
  };

  const handleUpdateProject = async () => {
    if (!project) return;

    try {
      setIsUpdating(true);
      setError(null);

      // Prepare the data, ensuring URLs are null if empty or invalid
      const githubUrl = formData.githubUrl.trim() || null;
      const deploymentUrl = formData.deploymentUrl.trim() || null;

      const updatedProject = await cartel.projects.update(project.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        githubUrl,
        deploymentUrl,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isPublic: formData.isPublic,
      });

      // Update the project state with the updated data
      setProject({ ...updatedProject, user: project.user });
    } catch (error) {
      console.error("Failed to update project:", error);
      setError(error instanceof Error ? error.message : "Failed to update project");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.push("/dash/projects")} variant="outline">
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">Project not found</p>
            <Button onClick={() => router.push("/dash/projects")} variant="outline">
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="px-8 py-8 pb-16 max-w-full">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dash/projects")}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </div>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                {!project.isPublic && (
                  <Badge variant="secondary">Private</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg">{project.description}</p>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/15 border border-destructive/20 rounded-md p-3 text-sm text-destructive mb-4">
              {error}
            </div>
          )}
        </div>

        {/* Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="treasuries">Treasuries ({projectTreasuries.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.tags && project.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Links</h4>
                    <div className="space-y-2">
                      {project.githubUrl && (
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            View Code
                          </a>
                        </Button>
                      )}
                      {project.deploymentUrl && (
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                          <a href={project.deploymentUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Live Site
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Visibility</h4>
                    <div className="flex items-center gap-2">
                      {project.isPublic ? (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {projectTreasuries.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Treasuries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {project.tags?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Tags</div>
                    </div>
                  </div>

                  {(project.createdAt || project.updatedAt) && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Timeline</h4>
                      {project.createdAt && (
                        <div className="text-xs text-muted-foreground">
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      )}
                      {project.updatedAt && project.updatedAt !== project.createdAt && (
                        <div className="text-xs text-muted-foreground">
                          Updated {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                  Update your project information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="settings-title">Title</Label>
                    <Input
                      id="settings-title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="settings-description">Description</Label>
                    <Textarea
                      id="settings-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your project"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="settings-githubUrl">GitHub URL</Label>
                      <Input
                        id="settings-githubUrl"
                        value={formData.githubUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="https://github.com/..."
                        type="url"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-deploymentUrl">Deployment URL</Label>
                      <Input
                        id="settings-deploymentUrl"
                        value={formData.deploymentUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, deploymentUrl: e.target.value }))}
                        placeholder="https://..."
                        type="url"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="settings-tags">Tags</Label>
                    <Input
                      id="settings-tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="react, typescript, nextjs (comma separated)"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="settings-isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                    />
                    <Label htmlFor="settings-isPublic">Make project public</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleUpdateProject}
                    disabled={isUpdating}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treasuries" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Treasury Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage Safe treasuries associated with this project
                </p>
              </div>
              <Button onClick={() => setIsAddTreasuryOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Treasury
              </Button>
            </div>

            {isLoadingTreasuries ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : projectTreasuries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No treasuries yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect a Safe treasury to track funds and enable DAO governance for this project.
                  </p>
                  <Button onClick={() => setIsAddTreasuryOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Treasury
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projectTreasuries.map((projectTreasury) => (
                  <TreasuryCard
                    key={projectTreasury.treasuryId}
                    projectTreasury={projectTreasury}
                    onRemove={() => loadProjectTreasuries()}
                    projectId={project.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddTreasuryDialog
        projectId={project.id}
        isOpen={isAddTreasuryOpen}
        onOpenChange={setIsAddTreasuryOpen}
        onTreasuryAdded={handleTreasuryAdded}
      />
    </div>
  );
}