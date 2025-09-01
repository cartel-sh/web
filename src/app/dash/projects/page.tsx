"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cartel } from "@/lib/cartel-client";
import type { ProjectWithUser } from "@cartel-sh/api";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ProjectFormData {
  title: string;
  description: string;
  githubUrl: string;
  deploymentUrl: string;
  tags: string;
  isPublic: boolean;
}

export default function ProjectsPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithUser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    githubUrl: "",
    deploymentUrl: "",
    tags: "",
    isPublic: true,
  });

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
      const projectsData = await cartel.projects.list({
        userId: user?.userId, // Show only current user's projects
        public: "all", // Include both public and private projects for the user
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      setError(null);

      // Prepare the data, ensuring URLs are null if empty or invalid
      const githubUrl = formData.githubUrl.trim() || null;
      const deploymentUrl = formData.deploymentUrl.trim() || null;

      const newProject = await cartel.projects.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        githubUrl,
        deploymentUrl,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isPublic: formData.isPublic,
      });

      setProjects(prev => [newProject, ...prev]);
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        githubUrl: "",
        deploymentUrl: "",
        tags: "",
        isPublic: true,
      });
    } catch (error) {
      console.error("Failed to create project:", error);
      setError(error instanceof Error ? error.message : "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditProject = (project: ProjectWithUser) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      githubUrl: project.githubUrl || "",
      deploymentUrl: project.deploymentUrl || "",
      tags: project.tags?.join(", ") || "",
      isPublic: project.isPublic,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      setIsUpdating(true);
      setError(null);

      // Prepare the data, ensuring URLs are null if empty or invalid
      const githubUrl = formData.githubUrl.trim() || null;
      const deploymentUrl = formData.deploymentUrl.trim() || null;

      const updatedProject = await cartel.projects.update(editingProject.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        githubUrl,
        deploymentUrl,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isPublic: formData.isPublic,
      });

      // Update the project in the local state
      setProjects(prev => prev.map(p => p.id === updatedProject.id 
        ? { ...updatedProject, user: editingProject.user } 
        : p
      ));
      
      setIsEditDialogOpen(false);
      setEditingProject(null);
      setFormData({
        title: "",
        description: "",
        githubUrl: "",
        deploymentUrl: "",
        tags: "",
        isPublic: true,
      });
    } catch (error) {
      console.error("Failed to update project:", error);
      setError(error instanceof Error ? error.message : "Failed to update project");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-muted-foreground">Discover and manage cartel projects</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new project to showcase your work in the cartel.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your project"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="githubUrl">GitHub URL</Label>
                      <Input
                        id="githubUrl"
                        value={formData.githubUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="https://github.com/..."
                        type="url"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deploymentUrl">Deployment URL</Label>
                      <Input
                        id="deploymentUrl"
                        value={formData.deploymentUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, deploymentUrl: e.target.value }))}
                        placeholder="https://..."
                        type="url"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="react, typescript, nextjs (comma separated)"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                    />
                    <Label htmlFor="isPublic">Make project public</Label>
                  </div>

                  {error && (
                    <div className="bg-destructive/15 border border-destructive/20 rounded-md p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Project"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Project Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                  <DialogDescription>
                    Update your project information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your project"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-githubUrl">GitHub URL</Label>
                      <Input
                        id="edit-githubUrl"
                        value={formData.githubUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="https://github.com/..."
                        type="url"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-deploymentUrl">Deployment URL</Label>
                      <Input
                        id="edit-deploymentUrl"
                        value={formData.deploymentUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, deploymentUrl: e.target.value }))}
                        placeholder="https://..."
                        type="url"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-tags">Tags</Label>
                    <Input
                      id="edit-tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="react, typescript, nextjs (comma separated)"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                    />
                    <Label htmlFor="edit-isPublic">Make project public</Label>
                  </div>

                  {error && (
                    <div className="bg-destructive/15 border border-destructive/20 rounded-md p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Updating..." : "Update Project"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && !isLoadingProjects && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadProjects} variant="outline">Retry</Button>
            </CardContent>
          </Card>
        )}

        {!error && isLoadingProjects ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !error && filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {projects.length === 0 ? "No projects yet" : "No projects match your search"}
              </p>
            </CardContent>
          </Card>
        ) : !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    {!project.isPublic && (
                      <Badge variant="secondary">Private</Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
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
                      {project.isPublic && (
                        <Badge variant="outline" className="text-xs">Public</Badge>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditProject(project)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {project.githubUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-1" />
                            Code
                          </a>
                        </Button>
                      )}
                      {project.deploymentUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.deploymentUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Demo
                          </a>
                        </Button>
                      )}
                    </div>

                    {(project.user || project.createdAt) && (
                      <div className="space-y-1">
                        {project.user && user && project.userId !== user.userId && (
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            {project.user.ensAvatar && (
                              <img 
                                src={project.user.ensAvatar} 
                                alt={project.user.ensName || 'User avatar'}
                                className="w-4 h-4 rounded-full"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <span>
                              {project.user.ensName || `${project.user.id.slice(0, 8)}...`}
                            </span>
                          </div>
                        )}
                        {project.createdAt && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                            {project.updatedAt && project.updatedAt !== project.createdAt && (
                              <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}