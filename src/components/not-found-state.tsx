import { IconMoodEmpty } from "@tabler/icons-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function NotFoundState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
        <IconMoodEmpty className="size-7" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-2xl tracking-tight">{title}</h1>
        <p className="max-w-sm text-balance text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex gap-2">
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>
          Go home
        </Link>
        <Link href="/players" className={buttonVariants({ variant: "ghost" })}>
          Player rankings
        </Link>
      </div>
    </div>
  );
}
