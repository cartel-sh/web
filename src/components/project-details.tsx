"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Github, Plus, Wallet, Shield, Users, DollarSign } from "lucide-react";
import { cartel } from "@/lib/cartel-client";
import type { ProjectWithUser, Treasury, ProjectTreasury } from "@cartel-sh/api";
import Link from "next/link";
import { AddTreasuryDialog } from "./add-treasury-dialog";
import { TreasuryCard } from "./treasury-card";

interface ProjectDetailsProps {
  project: ProjectWithUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetails({ project, isOpen, onOpenChange }: ProjectDetailsProps) {
  const [projectTreasuries, setProjectTreasuries] = useState<(ProjectTreasury & { treasury?: Treasury })[]>([]);
  const [isLoadingTreasuries, setIsLoadingTreasuries] = useState(false);
  const [isAddTreasuryOpen, setIsAddTreasuryOpen] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      loadProjectTreasuries();
    }
  }, [project, isOpen]);

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

  if (!project) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="line-clamp-1">{project.title}</span>
              {!project.isPublic && (
                <Badge variant="secondary">Private</Badge>
              )}
            </DialogTitle>
            <DialogDescription className="line-clamp-3">
              {project.description}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="treasuries" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Treasuries ({projectTreasuries.length})
              </TabsTrigger>
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
        </DialogContent>
      </Dialog>

      <AddTreasuryDialog
        projectId={project.id}
        isOpen={isAddTreasuryOpen}
        onOpenChange={setIsAddTreasuryOpen}
        onTreasuryAdded={handleTreasuryAdded}
      />
    </>
  );
}