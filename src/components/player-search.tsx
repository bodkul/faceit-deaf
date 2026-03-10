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
import { getSkillLevelFromElo } from "@/lib/faceit/utils";

export function PlayerSearch() {
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
          className="border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600 focus:border-neutral-700"
        />
        <InputGroupAddon className="text-neutral-600">
          <IconSearch size={16} />
        </InputGroupAddon>
      </InputGroup>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/50">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-neutral-700/40 to-transparent" />

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
                    className="flex w-full items-center gap-3 px-3 py-2.5 transition-colors hover:bg-neutral-900"
                    onClick={() => setIsOpen(false)}
                  >
                    <Avatar className="rounded-lg">
                      <AvatarImage
                        src={player.avatar ?? undefined}
                        alt={player.nickname ?? ""}
                      />
                      <AvatarFallback className="rounded-lg text-neutral-400 text-xs">
                        {player.nickname?.charAt(0) ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center gap-1.5">
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
                        <span className="font-medium text-sm text-white">
                          {player.nickname}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-neutral-500 text-xs">
                        {player.faceit_elo}
                      </span>
                      <SkillLevelIcon
                        level={getSkillLevelFromElo(player.faceit_elo)}
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
                <EmptyTitle className="text-neutral-400 text-sm">
                  No players found
                </EmptyTitle>
                <EmptyDescription className="text-neutral-600 text-xs">
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
