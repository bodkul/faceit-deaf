import { MainNav } from "@/components/main-nav";
import { UserMenu } from "@/components/user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center">
        <MainNav />
        <div className="ml-auto flex items-center gap-2">
          {/* <ModeToggle /> */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
