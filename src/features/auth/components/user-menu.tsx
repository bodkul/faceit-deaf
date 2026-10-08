"use client";

import { IconChartBar, IconLogout, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ user }: { user: NonNullable<Session["user"]> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="rounded-lg outline-none ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/25 focus-visible:ring-2 focus-visible:ring-ring data-popup-open:ring-foreground/25"
      >
        <Avatar className="cursor-pointer rounded-md border-none after:rounded-md after:border-none">
          <AvatarImage
            className="rounded-md"
            src={user.image ?? undefined}
            alt={user.name ?? undefined}
          />
          <AvatarFallback className="rounded-md">
            {user.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2.5 px-2 py-2">
            <Avatar className="size-9">
              <AvatarImage
                src={user.image ?? undefined}
                alt={user.name ?? undefined}
              />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-semibold text-foreground text-sm">
                {user.name}
              </span>
              <span className="truncate font-normal text-muted-foreground text-xs">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={`/player/${user.name}`} />}>
          <IconChartBar className="text-muted-foreground" />
          My stats
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/profile" />}>
          <IconUser className="text-muted-foreground" />
          Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
          <IconLogout />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
