import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/navigation";
import { SiteHeader } from "@/components/ui/site-header";
import { SiteFooter } from "@/components/ui/site-footer";
import { BackgroundLayout } from "@/components/ui/background-layout";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cartel",
  description: "Accelerating decentralized social one project, one commit, one standard at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="min-h-screen relative overflow-hidden">
            <BackgroundLayout />
            <Navigation />
            <div className="max-w-6xl mx-auto px-6 pt-16 relative z-10">
              <SiteHeader />
              <main className="relative z-10">
                {children}
              </main>
              <SiteFooter />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
