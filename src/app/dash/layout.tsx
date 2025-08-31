import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Cartel",
  description: "Your Cartel Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}