import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FaceitDeaf",
  description: "View your FACEIT CS2 performance for deaf Ukrainians.",
};

export default function RootLayout({
  leardboard,
  twitchStreams,
}: Readonly<{
  leardboard: React.ReactNode;
  twitchStreams: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${geistSans.variable} antialiased`}>
        <ThemeProvider attribute="class" enableSystem enableColorScheme>
          <main className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 cursor-default">
            <div className="flex flex-col space-y-20 items-center">
              <div className="flex flex-col text-center items-center">
                <Link href="/" className="font-black text-6xl uppercase">
                  Faceit Deaf
                </Link>
                <span className="text-2xl">
                  View your FACEIT CS2 performance for deaf Ukrainians.
                </span>
              </div>
              {twitchStreams}
              {leardboard}
            </div>
          </main>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
