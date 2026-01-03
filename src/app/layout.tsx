import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { Header } from "@/components/header";
import { siteConfig } from "@/config/site";
import { ReactQueryProvider } from "@/providers/react-query";

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
          <ReactQueryProvider>
            <Header />
            <main className="mx-auto max-w-6xl flex-1 space-y-4 p-4">
              {children}
            </main>
          </ReactQueryProvider>
        </ThemeProvider>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
