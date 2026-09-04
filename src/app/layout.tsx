import "@/app/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { domAnimation, LazyMotion } from "motion/react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { BGPattern } from "@/components/bg-pattern";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { siteConfig } from "@/config/site";
import { AuthProvider } from "@/providers/auth";
import { ReactQueryProvider } from "@/providers/react-query";

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteConfig.name}`,
    default: siteConfig.name,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableColorScheme>
          <AuthProvider>
            <ReactQueryProvider>
              <LazyMotion features={domAnimation}>
                <div className="relative flex min-h-screen w-full flex-col">
                  <BGPattern variant="grid" mask="fade-edges" />
                  <Header />
                  <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
                    {children}
                  </main>
                  <Footer />
                </div>
              </LazyMotion>
            </ReactQueryProvider>
          </AuthProvider>
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}
