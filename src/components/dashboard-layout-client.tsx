"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen w-screen">
      <DashboardSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={cn(
        "h-full overflow-hidden transition-all duration-300",
        isSidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  );
}