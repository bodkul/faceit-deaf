"use client";

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
      <DropdownMenuTrigger>
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
      <DropdownMenuContent
        align="end"
        className="w-56 border-neutral-800 bg-neutral-950"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={user.image ?? undefined}
                alt={user.name ?? undefined}
              />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col">
              <span className="font-medium text-sm text-white">
                {user.name}
              </span>
              <span className="text-neutral-500 text-xs">{user.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem
          className="text-neutral-300 hover:bg-neutral-900 hover:text-white focus:bg-neutral-900 focus:text-white"
          render={<Link href={`/player/${user.name}`} />}
        >
          Your Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-neutral-300 hover:bg-neutral-900 hover:text-white focus:bg-neutral-900 focus:text-white"
          render={<Link href={`/profile`} />}
        >
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
