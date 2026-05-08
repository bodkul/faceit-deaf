import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-border border-t">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-4 text-muted-foreground text-sm md:flex-row md:px-6">
        <p>Not affiliated with Valve or Faceit.</p>

        <p className="inline-flex items-center gap-1">
          <span>Built by</span>
          <Link
            className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground hover:underline"
            href="/player/bodkul"
          >
            <Image
              src="https://distribution.faceit-cdn.net/images/2a3722fd-d0f1-4e12-8619-b80137387ed8.jpeg"
              className="rounded-full"
              height={16}
              width={16}
              alt="bodkul"
            />
            bodkul
          </Link>
        </p>
      </div>
    </footer>
  );
}
