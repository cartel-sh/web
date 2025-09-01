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
      <div className={cn(
        "flex flex-col gap-2 py-3 transition-all duration-300",
        isCollapsed ? "px-2" : "px-5"
      )}>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mt-2 mb-4 h-12`}>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <Link
                href="/"
                className="text-2xl font-bold text-primary font-[family-name:var(--font-stoke)] hover:text-primary transition-colors py-1 block"
                aria-label="Back to main site"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="inline-block whitespace-nowrap">
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
            </div>
          )}
          <div className="flex-shrink-0">
            {isCollapsed ? (
              <Button
                variant="ghost"
                onClick={onToggle}
                className="h-9 w-9 p-0"
              >
                <Menu className="h-5 w-5" />
              </Button>
            ) : (
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
        </div>


        <div className="space-y-4">
          {!isCollapsed && (
            <div className="px-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Dashboard
              </h3>
            </div>
          )}
          <div className={`${isCollapsed ? "flex flex-col gap-2 items-center justify-center" : "flex flex-col gap-2"}`}>
            <Link href="/dash" aria-label="Dashboard" className="block">
              <Button
                variant={isActive("/dash") ? "secondary" : "ghost"}
                className={cn(
                  "font-medium text-base transition-colors overflow-hidden",
                  isCollapsed
                    ? "w-10 h-10 p-0 flex items-center justify-center"
                    : "relative w-full h-10"
                )}
                title={isCollapsed ? "Dashboard" : undefined}
              >
                {isCollapsed ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                  </svg>
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center w-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 flex-shrink-0"
                      >
                        <rect width="7" height="9" x="3" y="3" rx="1" />
                        <rect width="7" height="5" x="14" y="3" rx="1" />
                        <rect width="7" height="9" x="14" y="12" rx="1" />
                        <rect width="7" height="5" x="3" y="16" rx="1" />
                      </svg>
                    </div>
                    <div className="absolute left-13 flex items-center h-full whitespace-nowrap">
                      Dashboard
                    </div>
                  </>
                )}
              </Button>
            </Link>
            <Link href="/dash/projects" aria-label="Projects" className="block">
              <Button
                variant={isActive("/dash/projects") ? "secondary" : "ghost"}
                className={cn(
                  "font-medium text-base transition-colors overflow-hidden",
                  isCollapsed
                    ? "w-10 h-10 p-0 flex items-center justify-center"
                    : "relative w-full h-10"
                )}
                title={isCollapsed ? "Projects" : undefined}
              >
                {isCollapsed ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center w-10">
                      <FolderOpen className="h-4 w-4 flex-shrink-0" />
                    </div>
                    <div className="absolute left-13 flex items-center h-full whitespace-nowrap">
                      Projects
                    </div>
                  </>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className={cn(
        "mt-auto py-3 transition-all duration-300",
        isCollapsed ? "px-2" : "px-5"
      )}>
        <div className={cn(
          "transition-all duration-300 overflow-hidden",
          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}>
          {!isCollapsed && <UserMenu />}
        </div>
        {isCollapsed && (
          <Button
            variant="ghost"
            onClick={onToggle}
            className="h-10 w-10 p-0 mx-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}