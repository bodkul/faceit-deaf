import {
  IconCalendarEvent,
  IconTrophy,
  IconUsersGroup,
} from "@tabler/icons-react";

export const navLinks = [
  { label: "Players", href: "/players", icon: IconTrophy },
  { label: "Events", href: "/events", icon: IconCalendarEvent },
  { label: "Teams", href: "/teams", icon: IconUsersGroup },
] as const;

export function isNavLinkActive(pathname: string, href: string) {
  if (href === "/players") {
    return pathname === "/players" || pathname.startsWith("/player/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
