import type { Metadata } from "next";

import {
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderTitle,
} from "@/components/layout/page-header";
import { PlayerSearch } from "@/features/player/components/player-search";

export const metadata: Metadata = {
  title: "Player Rankings",
  description:
    "Every deaf and hard-of-hearing CS2 player we track, ranked by FACEIT ELO.",
};

export default function PlayersLayout({ children }: LayoutProps<"/players">) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <PageHeaderHeading>
          <PageHeaderTitle>{metadata.title?.toString()}</PageHeaderTitle>
          <PageHeaderDescription>{metadata.description}</PageHeaderDescription>
        </PageHeaderHeading>
        <PageHeaderActions className="w-full sm:w-72 lg:hidden">
          <PlayerSearch className="w-full" />
        </PageHeaderActions>
      </PageHeader>

      {children}
    </div>
  );
}
