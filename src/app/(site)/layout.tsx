import type React from "react";

import { BGPattern } from "@/components/bg-pattern";
import { Header } from "@/components/header";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <BGPattern variant="grid" mask="fade-edges" />
      <Header />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-12">
        {children}
      </main>
    </>
  );
}
