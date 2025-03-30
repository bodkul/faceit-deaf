import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import MainNav from "@/components/main-nav";
import ModeToggle from "@/components/mode-toogle";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.className} antialiased`}>
        <ThemeProvider attribute="class" enableSystem enableColorScheme>
          <div className="flex-col md:flex max-w-(--breakpoint-xl) mx-auto border-x border-b">
            <div className="border-b sticky top-0 z-10 border-border/40 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 dark:border-border">
              <div className="flex h-14 items-center px-4">
                <MainNav />
                <div className="ml-auto flex items-center gap-2">
                  <ModeToggle />
                </div>
              </div>
            </div>
            <main className="flex-1 space-y-4 p-8 pt-6">{children}</main>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
