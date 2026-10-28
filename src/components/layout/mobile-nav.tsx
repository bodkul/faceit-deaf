import { IconMenu2, IconX } from "@tabler/icons-react";
import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { NavCount } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Portal, PortalBackdrop } from "@/components/ui/portal";
import { isNavLinkActive, navLinks } from "@/config/nav";
import { useEventsCount } from "@/features/events/hooks/use-events-count";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { data: eventsCount } = useEventsCount();

  const Icon = open ? IconX : IconMenu2;

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        <Icon className="size-4.5" />
      </Button>
      {open && (
        <Portal className="top-14" id="mobile-menu">
          <PortalBackdrop />
          <nav className="grid animate-in gap-1 p-4 duration-200 fade-in-0 slide-in-from-top-2">
            {navLinks.map((link) => {
              const active = isNavLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex h-12 items-center gap-3 rounded-lg px-3 text-base font-medium transition-colors",
                    active
                      ? "bg-foreground/[0.07] text-foreground"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                  )}
                >
                  <link.icon className="size-5" />
                  {link.label}
                  {link.href === "/events" && <NavCount count={eventsCount} />}
                </Link>
              );
            })}
          </nav>
        </Portal>
      )}
    </div>
  );
}
