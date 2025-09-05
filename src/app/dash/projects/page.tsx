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
import { ExternalLink, Github, Plus, Search, Trash2, Bug, CircleDot, Settings, Eye, EyeOff } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useAtom } from "jotai";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useRef } from "react";
import {
  getOrderedProjectsAtom,
  initializeProjectSettingsAtom,
  toggleProjectVisibilityAtom,
  getProjectVisibilityAtom,
  getHiddenProjectCountAtom,
  toggleAllProjectsVisibilityAtom,
  updateProjectOrderAtom,
} from "@/atoms/project-settings";

interface ProjectFormData {
  title: string;
  description: string;
  githubUrl: string;
  deploymentUrl: string;
  tags: string;
  isPublic: boolean;
}

interface DragItem {
  type: string;
  id: string;
  index: number;
}

const PROJECT_TYPE = 'PROJECT';

interface DraggableProjectCardProps {
  project: ProjectWithUser;
  index: number;
  moveProject: (dragIndex: number, hoverIndex: number) => void;
  handleViewDetails: (project: ProjectWithUser) => void;
  user?: any;
}

const DraggableProjectCard: React.FC<DraggableProjectCardProps> = ({
  project,
  index,
  moveProject,
  handleViewDetails,
  user,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: PROJECT_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset?.y ?? 0) - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveProject(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: PROJECT_TYPE,
    item: () => {
      return { id: project.id, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <Card
      ref={ref}
      className="hover:shadow-lg transition-shadow cursor-pointer"
      style={{ opacity }}
      data-handler-id={handlerId}
      onClick={() => handleViewDetails(project)}
    >
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
                {project.tags.slice(0, 3).map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="outline" className="text-xs">
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
            {project.githubUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                onClick={(e) => e.stopPropagation()}
              >
                <Link href="/dash/issues">
                  <CircleDot className="h-4 w-4 mr-1" />
                  Issues
                </Link>
              </Button>
            )}
            {project.githubUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                onClick={(e) => e.stopPropagation()}
              >
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-1" />
                  Code
                </a>
              </Button>
            )}
            {project.deploymentUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                onClick={(e) => e.stopPropagation()}
              >
                <a href={project.deploymentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Site
                </a>
              </Button>
            )}
          </div>

          {/* {(project.user || project.createdAt) && (
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
            </div>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ProjectsPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    githubUrl: "",
    deploymentUrl: "",
    tags: "",
    isPublic: true,
  });

  // Jotai hooks for project settings
  const [, initializeSettings] = useAtom(initializeProjectSettingsAtom);
  const [, toggleVisibility] = useAtom(toggleProjectVisibilityAtom);
  const [getVisibility] = useAtom(getProjectVisibilityAtom);
  const [getOrderedProjects] = useAtom(getOrderedProjectsAtom);
  const [hiddenCount] = useAtom(getHiddenProjectCountAtom);
  const [, toggleAllVisibility] = useAtom(toggleAllProjectsVisibilityAtom);
  const [, updateOrder] = useAtom(updateProjectOrderAtom);

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

  // Initialize project settings when projects change
  useEffect(() => {
    if (projects.length > 0) {
      initializeSettings(projects);
    }
  }, [projects, initializeSettings]);

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


  const handleViewDetails = (project: ProjectWithUser) => {
    router.push(`/dash/projects/${project.id}`);
  };


  // Get ordered and filtered projects using Jotai
  const orderedProjects = getOrderedProjects(projects);
  
  // Apply search filter on top of visibility filter
  const filteredProjects = orderedProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Function to move projects (drag and drop)
  const moveProject = (dragIndex: number, hoverIndex: number) => {
    const draggedProject = filteredProjects[dragIndex];
    const newFilteredProjects = [...filteredProjects];
    newFilteredProjects.splice(dragIndex, 1);
    newFilteredProjects.splice(hoverIndex, 0, draggedProject);
    
    // Update the order in Jotai storage
    const newOrder = newFilteredProjects.map(p => p.id);
    updateOrder(newOrder);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-muted-foreground">Discover and manage cartel projects</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Project visibility dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    View Options
                    {hiddenCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5">
                        {hiddenCount} hidden
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Project Visibility</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Show/Hide All controls */}
                  <DropdownMenuItem onClick={() => toggleAllVisibility({ projects, makeVisible: true })}>
                    <Eye className="h-4 w-4 mr-2" />
                    Show All Projects
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleAllVisibility({ projects, makeVisible: false })}>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide All Projects
                  </DropdownMenuItem>
                  
                  {projects.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Individual Projects</DropdownMenuLabel>
                      {projects.map((project) => (
                        <DropdownMenuCheckboxItem
                          key={project.id}
                          checked={getVisibility(project.id)}
                          onCheckedChange={() => toggleVisibility(project.id)}
                        >
                          <span className="truncate">{project.title}</span>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

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
                    <Label htmlFor="isPublic">Public project</Label>
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
            </div>

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
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project, index) => (
              <DraggableProjectCard
                key={project.id}
                project={project}
                index={index}
                moveProject={moveProject}
                handleViewDetails={handleViewDetails}
                user={user}
              />
            ))}
          </div>
        )}
      </div>
      </div>
    </DndProvider>
  );
}