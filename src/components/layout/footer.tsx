import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-border border-t supports-backdrop-filter:bg-background/80">
      <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
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
