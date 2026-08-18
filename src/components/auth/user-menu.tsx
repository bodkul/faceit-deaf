"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ user }: { user: NonNullable<Session["user"]> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 cursor-pointer rounded-md border-none after:rounded-md after:border-none">
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
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              src={user.image ?? undefined}
              alt={user.name ?? undefined}
            />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span className="font-medium text-sm text-white">{user.name}</span>
            <span className="text-neutral-500 text-xs">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem
          asChild
          className="text-neutral-300 hover:bg-neutral-900 hover:text-white focus:bg-neutral-900 focus:text-white"
        >
          <Link href={`/player/${user.name}`}>Your profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="text-neutral-300 hover:bg-neutral-900 hover:text-white focus:bg-neutral-900 focus:text-white"
        >
          <Link href="/profile">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-neutral-500 hover:bg-neutral-900 hover:text-red-400 focus:bg-neutral-900 focus:text-red-400"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
