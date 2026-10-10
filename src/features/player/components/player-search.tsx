"use client";

import { IconSearch } from "@tabler/icons-react";
import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { FaceitLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { usePlayerSearch } from "@/features/player/hooks/use-player-search";
import { getCountryFlagUrl } from "@/lib/country";

export function PlayerSearch({
  className,
  placeholder = "Search players…",
}: {
  className?: string;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: players, isLoading } = usePlayerSearch(query);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <InputGroup className="bg-card">
        <InputGroupInput
          ref={inputRef}
          placeholder={placeholder}
          aria-label="Search players"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="text-foreground placeholder:text-faint"
        />
        <InputGroupAddon className="text-faint">
          <IconSearch size={16} />
        </InputGroupAddon>
      </InputGroup>

      {isOpen && query.length >= 2 && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 min-w-72 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl shadow-black/50">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner />
            </div>
          ) : players && players.length > 0 ? (
            <ul className="max-h-80 overflow-auto">
              {players.map((player) => (
                <li key={player.id}>
                  <Link
                    href={`/player/${player.nickname}`}
                    className="flex w-full items-center gap-3 px-3 py-2.5 transition-colors hover:bg-foreground/5"
                    onClick={() => setIsOpen(false)}
                  >
                    <Avatar className="rounded-lg">
                      <AvatarImage
                        src={player.avatar ?? undefined}
                        alt={player.nickname ?? ""}
                      />
                      <AvatarFallback className="rounded-lg text-muted-foreground text-xs">
                        {player.nickname?.charAt(0) ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center gap-1.5">
                        {player.country && (
                          <Image
                            className="shrink-0 rounded-xs"
                            src={getCountryFlagUrl(
                              player.country.toLowerCase(),
                              20,
                            )}
                            width={15}
                            height={10}
                            alt={`${player.country} flag`}
                          />
                        )}
                        <span className="font-medium text-foreground text-sm">
                          {player.nickname}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-muted-foreground text-xs">
                        {player.faceit_elo}
                      </span>
                      <FaceitLevelIcon
                        elo={player.faceit_elo}
                        className="size-5"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle className="text-muted-foreground text-sm">
                  No players found
                </EmptyTitle>
                <EmptyDescription className="text-faint text-xs">
                  Try searching for a different nickname
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      )}
    </div>
  );
}
