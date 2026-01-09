"use client";

import { IconMenu2, IconSearch } from "@tabler/icons-react";
import Link from "next/link";

import { FaceitIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavLink {
  href?: string;
  label: string;
}

const navigationLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/maps", label: "Maps" },
];

export const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 px-4 backdrop-blur **:no-underline supports-backdrop-filter:bg-background/60 md:px-6">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          {isMobile && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                  variant="ghost"
                  size="icon"
                >
                  <IconMenu2 />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-1">
                <NavigationMenu
                  className="max-w-none"
                  data-orientation="vertical"
                >
                  <NavigationMenuList className="flex-col items-start gap-0">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem
                        key={`${index}-${link.label}`}
                        className="w-full"
                      >
                        <Link
                          href={link.href || "#"}
                          className="flex w-full cursor-pointer items-center rounded-md px-3 py-2 font-medium text-sm no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuItem>
                    ))}
                    {/* <NavigationMenuItem
                      className="w-full"
                      role="presentation"
                      aria-hidden={true}
                    >
                      <Separator />
                    </NavigationMenuItem>
                    <NavigationMenuItem className="w-full">
                      <button className="flex w-full cursor-pointer items-center rounded-md px-3 py-2 font-medium text-sm no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        Sign In
                      </button>
                    </NavigationMenuItem> */}
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
          )}
          {/* Main nav */}
          <div className="flex flex-1 items-center gap-6 max-md:justify-between">
            <Link
              href="/"
              className="flex cursor-pointer items-center space-x-2 text-primary transition-colors hover:text-primary/90"
            >
              <div className="text-2xl">
                <FaceitIcon className="size-6 fill-[#ff5500] text-[#ff5500]" />
              </div>
              <span className="hidden font-bold text-xl sm:inline-block">
                csdeaf.pro
              </span>
            </Link>
            {/* Navigation menu */}
            {!isMobile && (
              <NavigationMenu className="flex">
                <NavigationMenuList className="gap-1">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={`${index}-${link.label}`}>
                      <NavigationMenuLink
                        className="group inline-flex h-10 w-max cursor-pointer items-center justify-center rounded-md px-4 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-primary focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                        asChild
                      >
                        <Link href={link.href || "#"}>{link.label}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            )}
            {/* Search form */}
            <form className="relative">
              <Input
                name="search"
                className="peer h-8 ps-8 pe-2"
                placeholder="Search..."
                type="search"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/80 peer-disabled:opacity-50">
                <IconSearch size={16} />
              </div>
            </form>
          </div>
        </div>
        {/* Right side */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            <Button size="sm">
              <FaceitIcon className="size-4" />
              Login with Faceit
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
