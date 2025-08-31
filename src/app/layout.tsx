import type { Metadata } from "next";
import { Italianno, Outfit, Stoke } from "next/font/google";
import "./globals.css";
import "overlayscrollbars/overlayscrollbars.css";
import { Providers } from "@/components/providers";
import { AppScrollbars } from "@/components/ui/app-scrollbars";

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
            {children}
          </AppScrollbars>
        </Providers>
      </body>
    </html>
  );
}
