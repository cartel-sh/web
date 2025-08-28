import type { Metadata } from "next";
import { Italianno, Outfit, Stoke } from "next/font/google";
import "./globals.css";
import "overlayscrollbars/overlayscrollbars.css";
import { Providers } from "@/components/providers";
import { AppScrollbars } from "@/components/ui/app-scrollbars";
import { Sidebar } from "@/components/sidebar";
import { SiteHeader } from "@/components/ui/site-header";
import { SiteFooter } from "@/components/ui/site-footer";
import { BackgroundLayout } from "@/components/ui/background-layout";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const italianno = Italianno({
  variable: "--font-italianno",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const stoke = Stoke({
  variable: "--font-stoke",
  subsets: ["latin"],
  weight: "300",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cartel",
  description: "Accelerating public goods",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${italianno.variable} ${stoke.variable} font-sans antialiased`}
      >
        <Providers>
          <AppScrollbars>
            <div className="min-h-screen relative overflow-hidden">
              <div id="top" className="absolute top-0" />
              <BackgroundLayout />
              <div className="relative z-10">
                <div className="lg:ml-64">
                  <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
                      <SiteHeader />
                    </div>
                    <main className="relative z-10">
                      {children}
                    </main>
                    <SiteFooter />
                  </div>
                </div>
                <Sidebar />
              </div>
            </div>
          </AppScrollbars>
        </Providers>
      </body>
    </html>
  );
}
