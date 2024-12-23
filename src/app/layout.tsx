import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";

import { FaceitIcon } from "./icons";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "faceitdeaf",
  description: "View your FACEIT CS2 performance for deaf Ukrainians.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${geistSans.variable} antialiased`}>
        <ThemeProvider attribute="class" enableSystem enableColorScheme>
          <div className="flex-col md:flex max-w-screen-xl mx-auto border-x border-b">
            <div className="border-b sticky top-0 z-10 border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
              <div className="flex h-14 items-center px-4">
                <div className="flex mr-4">
                  <Link
                    className="flex mr-4 items-center gap-2 lg:mr-6"
                    href="/"
                  >
                    <FaceitIcon className="w-6 h-6 text-[#ff5500] fill-[#ff5500]" />
                    <span className="inline-block font-bold">
                      {metadata.title!.toString()}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            <main className="flex-1 space-y-4 p-8 pt-6">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
