import type { Metadata } from "next";
import DashboardLayoutClient from "@/components/dashboard-layout-client";

export const metadata: Metadata = {
  title: "Dashboard - Cartel",
  description: "Your Cartel Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}