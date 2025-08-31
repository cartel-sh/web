"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SplittingText } from "@/components/animate-ui/text/splitting";
import { UserMenu } from "@/components/user-menu";
import { 
  LayoutGrid, 
  User, 
  FolderOpen, 
  Settings, 
  Activity,
  Users,
  FileText,
  BarChart,
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
      <div className="flex flex-col gap-2 px-3 py-3">
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
          {!isCollapsed && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Dashboard
            </p>
          )}
          
          <Link href="/dash" aria-label="Dashboard Overview">
            <Button 
              variant={isActive("/dash") ? "secondary" : "ghost"} 
              className={cn(
                "w-full font-medium text-base gap-2",
                isCollapsed ? "justify-center px-2" : "justify-start"
              )}
              title={isCollapsed ? "Overview" : undefined}
            >
              <LayoutGrid className="h-4 w-4" />
              {!isCollapsed && "Overview"}
            </Button>
          </Link>

          <Link href="/dash/profile" aria-label="Profile">
            <Button 
              variant={isActive("/dash/profile") ? "secondary" : "ghost"} 
              className={cn(
                "w-full font-medium text-base gap-2",
                isCollapsed ? "justify-center px-2" : "justify-start"
              )}
              title={isCollapsed ? "Profile" : undefined}
            >
              <User className="h-4 w-4" />
              {!isCollapsed && "Profile"}
            </Button>
          </Link>

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

          <Link href="/dash/activity" aria-label="Activity">
            <Button 
              variant={isActive("/dash/activity") ? "secondary" : "ghost"} 
              className={cn(
                "w-full font-medium text-base gap-2",
                isCollapsed ? "justify-center px-2" : "justify-start"
              )}
              title={isCollapsed ? "Activity" : undefined}
            >
              <Activity className="h-4 w-4" />
              {!isCollapsed && "Activity"}
            </Button>
          </Link>

          <Link href="/dash/analytics" aria-label="Analytics">
            <Button 
              variant={isActive("/dash/analytics") ? "secondary" : "ghost"} 
              className={cn(
                "w-full font-medium text-base gap-2",
                isCollapsed ? "justify-center px-2" : "justify-start"
              )}
              title={isCollapsed ? "Analytics" : undefined}
            >
              <BarChart className="h-4 w-4" />
              {!isCollapsed && "Analytics"}
            </Button>
          </Link>
        </div>

        <div className="space-y-1 pt-4 border-t">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Community
            </p>
          )}
          
          <Link href="/dash/members" aria-label="Members">
            <Button 
              variant={isActive("/dash/members") ? "secondary" : "ghost"} 
              className={cn(
                "w-full font-medium text-base gap-2",
                isCollapsed ? "justify-center px-2" : "justify-start"
              )}
              title={isCollapsed ? "Members" : undefined}
            >
              <Users className="h-4 w-4" />
              {!isCollapsed && "Members"}
            </Button>
          </Link>

          <Link href="/dash/proposals" aria-label="Proposals">
            <Button 
              variant={isActive("/dash/proposals") ? "secondary" : "ghost"} 
              className={cn(
                "w-full font-medium text-base gap-2",
                isCollapsed ? "justify-center px-2" : "justify-start"
              )}
              title={isCollapsed ? "Proposals" : undefined}
            >
              <FileText className="h-4 w-4" />
              {!isCollapsed && "Proposals"}
            </Button>
          </Link>
        </div>

        <div className="space-y-1 pt-4 border-t">
          <Link href="/dash/settings" aria-label="Settings">
            <Button 
              variant={isActive("/dash/settings") ? "secondary" : "ghost"} 
              className={cn(
                "w-full font-medium text-base gap-2",
                isCollapsed ? "justify-center px-2" : "justify-start"
              )}
              title={isCollapsed ? "Settings" : undefined}
            >
              <Settings className="h-4 w-4" />
              {!isCollapsed && "Settings"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-auto pt-2 border-t px-3">
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