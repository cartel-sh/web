"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Github } from "lucide-react";
import type { ProjectWithUser } from "@cartel-sh/api";

interface CreateIssueDialogProps {
  project: ProjectWithUser;
}

export function CreateIssueDialog({ project }: CreateIssueDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const extractRepoInfo = (githubUrl: string) => {
    try {
      const url = new URL(githubUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        return {
          owner: pathParts[0],
          repo: pathParts[1]
        };
      }
    } catch (error) {
      console.error('Failed to parse GitHub URL:', error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!project.githubUrl) {
      setError("Project does not have a GitHub URL");
      return;
    }

    const repoInfo = extractRepoInfo(project.githubUrl);
    if (!repoInfo) {
      setError("Invalid GitHub URL format");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/github/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are sent with the request
        body: JSON.stringify({
          owner: repoInfo.owner,
          repo: repoInfo.repo,
          title: title.trim(),
          body: body.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Issue creation failed:', errorData);
        
        let errorMessage = errorData.error || 'Failed to create issue';
        if (errorData.debug) {
          console.log('Debug info:', errorData.debug);
          // Add more specific error messages based on debug info
          if (errorData.debug.cookiesFound) {
            errorMessage += ` (Debug: Found cookies: ${errorData.debug.cookiesFound.join(', ')})`;
          }
          if (errorData.debug.connectedPlatforms) {
            errorMessage += ` (Connected platforms: ${errorData.debug.connectedPlatforms.join(', ')})`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const { issue } = await response.json();
      
      // Success! Close dialog and optionally navigate to the new issue
      handleClose();
      
      // Open the new issue in a new tab
      if (issue.html_url) {
        window.open(issue.html_url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to create issue:', error);
      setError(error instanceof Error ? error.message : 'Failed to create issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg">
          <Plus className="h-3 w-3" />
          <span className="sr-only">Create issue</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Create Issue in {project.title}
          </DialogTitle>
          <DialogDescription>
            Create a new issue in the {project.title} repository. You must have a GitHub account connected to create issues.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Description</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Detailed description of the issue (optional)"
                rows={6}
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Creating..." : "Create Issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}