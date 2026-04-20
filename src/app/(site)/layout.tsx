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
      <main className="mx-auto max-w-6xl flex-1 space-y-4 p-4">{children}</main>
    </>
  );
}
