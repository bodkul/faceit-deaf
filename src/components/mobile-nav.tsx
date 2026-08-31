import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Portal, PortalBackdrop } from "@/components/ui/portal";
import { useEventsCount } from "@/hooks/use-events-count";
import { navLinks } from "@/lib/nav-links";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  const { data: eventsCount } = useEventsCount();

  const Icon = open ? IconX : IconMenu2;

  const badgeCountByHref: Partial<Record<string, number | null>> = {
    "/events": eventsCount,
  };

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        className="md:hidden"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        <Icon className="size-4.5" />
      </Button>
      {open && (
        <Portal className="top-14" id="mobile-menu">
          <PortalBackdrop />
          <div
            className={cn(
              "data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
              "size-full p-4",
            )}
            data-slot={open ? "open" : "closed"}
          >
            <nav className="grid gap-y-2">
              {navLinks.map((link) => {
                const badgeCount = badgeCountByHref[link.href];

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={buttonVariants({
                      variant: "ghost",
                      className: "justify-start",
                    })}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                    {!!badgeCount && (
                      <Badge variant="destructive">{badgeCount}</Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </Portal>
      )}
    </div>
  );
}
