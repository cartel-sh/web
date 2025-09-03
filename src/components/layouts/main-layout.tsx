import { Sidebar } from "@/components/sidebar";
import { SiteHeader } from "@/components/ui/site-header";
import { SiteFooter } from "@/components/ui/site-footer";
import { BackgroundLayout } from "@/components/ui/background-layout";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div id="top" className="absolute top-0" />
      <BackgroundLayout />
      <div className="relative z-10">
        <div className="lg:ml-64">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
              <SiteHeader />
            </div>
            <main className="pb-12">
              {children}
            </main>
            <SiteFooter />
          </div>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}