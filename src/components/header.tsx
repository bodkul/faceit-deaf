import MainNav from "@/components/main-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center">
        <MainNav />
      </div>
    </header>
  );
}
