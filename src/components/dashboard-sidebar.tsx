"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SplittingText } from "@/components/animate-ui/text/splitting";
import { UserMenu } from "@/components/user-menu";
import {
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ isCollapsed, onToggle }: DashboardSidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 border-r flex flex-col items-stretch shrink-0 z-40 bg-background/95 backdrop-blur transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      aria-label="Dashboard navigation"
    >
      <div className="flex flex-col gap-2 px-5 py-3">
        <div className={cn(
          "flex items-center mt-2 mb-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed ? (
            <Link
              href="/"
              className="text-2xl font-bold text-primary font-[family-name:var(--font-stoke)] hover:text-primary transition-colors py-1"
              aria-label="Back to main site"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="inline-block">
                {isHovered ? (
                  <SplittingText
                    key="spread"
                    text="Cartel"
                    type="chars"
                    motionVariants={{
                      initial: { x: 0, opacity: 1, letterSpacing: '0em' },
                      animate: { x: 0, opacity: 1, letterSpacing: '0.2em' },
                      transition: { duration: 0.3, ease: 'easeOut' },
                      stagger: 0.03
                    }}
                  />
                ) : (
                  <SplittingText
                    key="normal"
                    text="Cartel"
                    type="chars"
                    motionVariants={{
                      initial: { x: 0, opacity: 0 },
                      animate: { x: 0, opacity: 1 },
                      transition: { duration: 0.2, ease: 'easeOut' },
                      stagger: 0.02
                    }}
                  />
                )}
              </div>
            </Link>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>


        <div className="space-y-1">
          <Link href="/dash/projects" aria-label="Projects">
            <Button
              variant={isActive("/dash/projects") ? "secondary" : "ghost"}
              className={cn(
                "w-full font-medium text-base gap-2",
                isCollapsed ? "justify-center px-2" : "justify-start"
              )}
              title={isCollapsed ? "Projects" : undefined}
            >
              <FolderOpen className="h-4 w-4" />
              {!isCollapsed && "Projects"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-auto py-3 px-5">
        {!isCollapsed && <UserMenu />}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}