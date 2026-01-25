"use client";

import { IconSearch } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { SkillLevelIcon } from "@/components/icons";
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
import { usePlayerSearch } from "@/hooks/usePlayerSearch";
import { getCountryFlagUrl } from "@/lib/country";

export function PlayerSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { players, isLoading } = usePlayerSearch(query);

  // Close dropdown when clicking outside
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

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <InputGroup>
        <InputGroupInput
          ref={inputRef}
          placeholder="Search player..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <InputGroupAddon>
          <IconSearch />
        </InputGroupAddon>
      </InputGroup>

      {/* Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full right-0 z-50 mt-2 w-72 rounded-md border bg-popover shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Spinner className="size-5" />
            </div>
          ) : players && players.length > 0 ? (
            <ul className="max-h-80 overflow-auto">
              {players.map((player) => (
                <li key={player.id}>
                  <Link
                    href={`/player/${player.nickname}`}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <Avatar>
                      <AvatarImage
                        src={player.avatar ?? undefined}
                        alt={player.nickname ?? ""}
                      />
                      <AvatarFallback className="text-xs">
                        {player.nickname?.charAt(0) ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col">
                      <div className="flex flex-row items-center gap-1">
                        {player.country && (
                          <Image
                            className="h-2.5 w-3.75 shrink-0 rounded-xs"
                            src={getCountryFlagUrl(
                              player.country.toLowerCase(),
                              20,
                            )}
                            width={15}
                            height={10}
                            alt={`${player.country} flag`}
                          />
                        )}
                        <span className="text-popover-foreground">
                          {player.nickname}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                      <span className="text-muted-foreground text-xs">
                        {player.faceit_elo} ELO
                      </span>
                      <SkillLevelIcon
                        level={player.skill_level ?? 1}
                        className="size-6"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty className="md:p-6">
              <EmptyHeader>
                <EmptyTitle className="text-sm">No players found</EmptyTitle>
                <EmptyDescription className="text-xs">
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
