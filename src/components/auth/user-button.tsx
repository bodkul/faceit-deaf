"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { FaceitIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (status === "unauthenticated" || !session?.user) {
    return (
      <Button
        onClick={() => signIn("faceit")}
        className="border border-[#ff5500]/30 bg-[#ff5500]/10 text-[#ff5500] hover:bg-[#ff5500]/20 hover:text-[#ff5500]"
        variant="ghost"
      >
        <FaceitIcon className="size-4" data-icon="inline-start" />
        Login with Faceit
      </Button>
    );
  }

  const { user } = session;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-neutral-800"
        >
          <Avatar className="size-8 border border-neutral-800">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
            <AvatarFallback className="bg-neutral-800 text-neutral-400 text-xs">
              {user.name?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border-neutral-800 bg-neutral-950"
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar className="border border-neutral-800">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
            <AvatarFallback className="bg-neutral-800 text-neutral-400 text-xs">
              {user.name?.charAt(0) ?? "U"}
            </AvatarFallback>
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
          <Link href={`/player/${user.name}`}>Statistics</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-neutral-500 hover:bg-neutral-900 hover:text-red-400 focus:bg-neutral-900 focus:text-red-400"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
