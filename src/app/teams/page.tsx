import { IconUsersGroup } from "@tabler/icons-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function TeamsPage() {
  return (
    <Empty className="rounded-xl border border-border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconUsersGroup />
        </EmptyMedia>
        <EmptyTitle>Team pages are coming soon</EmptyTitle>
        <EmptyDescription>
          Until then, team rosters and results live on each event's Teams tab.
        </EmptyDescription>
      </EmptyHeader>
      <Link href="/events" className={buttonVariants({ variant: "secondary" })}>
        Browse events
      </Link>
    </Empty>
  );
}
