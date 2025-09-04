"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { RefObject, useEffect, useState, memo, useCallback } from "react";
import { cartel } from "@/lib/cartel-client";
import type { ProjectWithUser } from "@cartel-sh/api";
import { useGitHubIssues } from "@/hooks/useGitHubIssues";
import { ExternalLink, Github, Clock, User, UserCheck } from "lucide-react";
import Link from "next/link";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { formatTimeSince } from '@/lib/format-time';
import { ViewOptions } from '@/components/view-options';
import { useAtomValue, useSetAtom } from 'jotai';
import { getOrderedProjectsAtom, updateProjectOrderAtom } from '@/atoms/project-settings';
import { CreateIssueDialog } from '@/components/create-issue-dialog';

interface ProjectIssuesProps {
  project: ProjectWithUser;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
}

const ProjectIssuesColumn = memo(function ProjectIssuesColumn({ project, index, moveColumn }: ProjectIssuesProps) {
  const { issues, isLoading, error, repoInfo } = useGitHubIssues(project.githubUrl || '');

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'column',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'column',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveColumn(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => {
        drag(drop(node));
        dragPreview(node);
      }}
      className={`flex-shrink-0 w-80 h-full ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="h-full flex flex-col p-0">
        <CardHeader className="p-2 flex-shrink-0 cursor-move">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-semibold truncate">{project.title}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                {project.description}
              </CardDescription>
            </div>
            <div className="flex-shrink-0">
              <CreateIssueDialog project={project} />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            {project.githubUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-3 w-3 mr-1" />
                  Code
                </a>
              </Button>
            )}
            {project.deploymentUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={project.deploymentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Site
                </a>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 pt-0 overflow-hidden p-2">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-muted-foreground py-4">
              <p className="text-xs">{error}</p>
              {error.includes('rate limit') && (
                <p className="text-xs mt-2 text-amber-600">
                  Server needs a GitHub token configured for higher rate limits
                </p>
              )}
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              <p className="text-xs">No open issues</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="border rounded-lg p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <a
                          href={issue.user.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <img
                            src={issue.user.avatar_url}
                            alt={issue.user.login}
                            className="w-8 h-8 rounded-full hover:ring-2 hover:ring-primary transition-all"
                          />
                        </a>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <a
                              href={issue.user.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-muted-foreground truncate hover:text-primary transition-colors"
                            >
                              {issue.user.login}
                            </a>
                            <span className="text-xs text-muted-foreground">#{issue.number}</span>
                          </div>
                          <a
                            href={issue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium hover:text-primary transition-colors line-clamp-2"
                          >
                            {issue.title}
                          </a>
                        </div>
                      </div>

                      {issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {issue.labels.slice(0, 3).map((label) => (
                            <Badge
                              key={label.id}
                              variant="outline"
                              className="text-xs px-1 py-0"
                              style={{
                                backgroundColor: `#${label.color}20`,
                                borderColor: `#${label.color}40`,
                              }}
                            >
                              {label.name}
                            </Badge>
                          ))}
                          {issue.labels.length > 3 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              +{issue.labels.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {issue.assignee ? (
                            <>
                              <UserCheck className="h-3 w-3 text-muted-foreground" />
                              <img
                                src={issue.assignee.avatar_url}
                                alt={issue.assignee.login}
                                className="w-3 h-3 rounded-full"
                              />
                              <span className="text-xs text-muted-foreground truncate max-w-20">
                                {issue.assignee.login}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 italic">Unassigned</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground/60" />
                          <span className="text-xs text-muted-foreground/60">
                            {formatTimeSince(issue.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default function IssuesPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithUser[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getOrderedProjects = useAtomValue(getOrderedProjectsAtom);
  const updateProjectOrder = useSetAtom(updateProjectOrderAtom);

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

  const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
    const visibleProjects = getOrderedProjects(projects);
    const draggedProject = visibleProjects[dragIndex];
    const newOrder = [...visibleProjects];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, draggedProject);
    updateProjectOrder(newOrder.map(p => p.id));
  }, [projects, getOrderedProjects, updateProjectOrder]);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      setError(null);
      // Get all public projects that have GitHub URLs
      const projectsData = await cartel.projects.list({
        public: "true",
        limit: 50,
      });

      // Filter projects that have GitHub URLs
      const projectsWithGithub = projectsData.filter(project => project.githubUrl);
      setProjects(projectsWithGithub);
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

  if (!isAuthenticated || !user) {
    return null; // Will redirect to home
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-8 py-8 h-screen flex flex-col">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Issues</h1>
                <p className="text-muted-foreground">GitHub issues for open source projects</p>
              </div>
              <ViewOptions projects={projects} />
            </div>
          </div>

          {error && (
            <Card className="mb-6">
              <CardContent className="text-center py-4">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={loadProjects} variant="outline">Retry</Button>
              </CardContent>
            </Card>
          )}

          {!error && isLoadingProjects ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !error && projects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-4">
                <p className="text-muted-foreground">
                  No open source projects with GitHub links found
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dash/projects">Browse Projects</Link>
                </Button>
              </CardContent>
            </Card>
          ) : !error && (
            <Card className="flex-1 min-h-0 p-3">
              <ScrollArea orientation="both" className="flex flex-row pr-4 pb-4 gap-2 h-full">
                <div className="flex flex-row gap-3 h-full">
                  {getOrderedProjects(projects).map((project, index) => (
                    <ProjectIssuesColumn
                      key={project.id}
                      project={project}
                      index={index}
                      moveColumn={moveColumn}
                    />
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
      </div>
    </DndProvider>
  );
}