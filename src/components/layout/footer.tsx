import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/layout/header";
import { navLinks } from "@/config/nav";

export function Footer() {
  return (
    <footer className="mt-16 w-full border-border border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo className="-ml-1.5 w-fit" />
          <p className="max-w-sm text-faint text-sm">
            Stats and live matches for the deaf and hard-of-hearing CS2
            community. Not affiliated with FACEIT.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <nav className="flex gap-4 text-muted-foreground text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="inline-flex items-center gap-1.5 text-faint text-sm">
            Built by
            <Link
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              href="/player/bodkul"
            >
              <Image
                src="https://distribution.faceit-cdn.net/images/2a3722fd-d0f1-4e12-8619-b80137387ed8.jpeg"
                className="rounded-full"
                height={16}
                width={16}
                alt=""
              />
              bodkul
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
