"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { SkillLevelIcon } from "@/components/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
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
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            className="rounded-full"
            size="icon-xs"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            disabled={!query.length}
          >
            <IconX />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {/* Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full right-0 z-50 mt-1 w-72 rounded-md border bg-popover shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Spinner className="size-5" />
            </div>
          ) : players && players.length > 0 ? (
            <ul className="max-h-80 overflow-auto py-1">
              {players.map((player) => (
                <li key={player.id}>
                  <Link
                    href={`/player/${player.nickname}`}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <SkillLevelIcon
                      level={player.skill_level ?? 1}
                      className="size-6 shrink-0"
                    />
                    <div className="flex min-w-0 flex-1 items-center gap-2">
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
                      <span className="truncate font-medium">
                        {player.nickname}
                      </span>
                    </div>
                    <span className="shrink-0 text-muted-foreground text-xs">
                      {player.faceit_elo} ELO
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-4 text-center text-muted-foreground text-sm">
              No players found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
