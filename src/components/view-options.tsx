"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Settings2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  projectSettingsAtom,
  setProjectVisibilityAtom,
  toggleAllProjectsVisibilityAtom,
  getHiddenProjectCountAtom,
} from "@/atoms/project-settings";
import type { ProjectWithUser } from "@cartel-sh/api";

interface ViewOptionsProps {
  projects: ProjectWithUser[];
}

export function ViewOptions({ projects }: ViewOptionsProps) {
  const projectSettings = useAtomValue(projectSettingsAtom);
  const setVisibility = useSetAtom(setProjectVisibilityAtom);
  const toggleAllVisibility = useSetAtom(toggleAllProjectsVisibilityAtom);
  const hiddenCount = useAtomValue(getHiddenProjectCountAtom);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Settings2 className="h-4 w-4 mr-2" />
          View Options
          {hiddenCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1"
            >
              {hiddenCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Project Visibility</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            toggleAllVisibility({
              projects: projects,
              makeVisible: true,
            })
          }
        >
          Show All Projects
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            toggleAllVisibility({
              projects: projects,
              makeVisible: false,
            })
          }
        >
          Hide All Projects
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {projects.map((project) => (
            <DropdownMenuCheckboxItem
              key={project.id}
              checked={projectSettings.visibility[project.id] !== false}
              onCheckedChange={(checked) =>
                setVisibility({ projectId: project.id, visible: checked })
              }
            >
              <span className="truncate">{project.title}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}