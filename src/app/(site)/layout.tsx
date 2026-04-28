import type React from "react";

import { BGPattern } from "@/components/bg-pattern";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <BGPattern variant="grid" mask="fade-edges" />
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
