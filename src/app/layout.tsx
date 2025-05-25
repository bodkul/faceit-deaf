import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import MainNav from "@/components/main-nav";
// import ModeToggle from "@/components/mode-toogle";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteConfig.name}`,
    default: siteConfig.name,
  },
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableColorScheme>
          <header className="sticky top-0 z-10 border-b bg-background/95 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
            <div className="mx-auto flex h-14 max-w-6xl items-center">
              <MainNav />
              {/* <div className="ml-auto flex items-center gap-2">
                  <ModeToggle />
                </div> */}
            </div>
          </header>
          <main className="mx-auto max-w-6xl flex-1 space-y-4 p-4">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
