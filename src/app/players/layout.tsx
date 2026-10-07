import type { Metadata } from "next";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderTitle,
} from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Player Rankings",
  description: "Player rankings for the DEAF community, ranked by FACEIT ELO",
};

export default function PlayersLayout({ children }: LayoutProps<"/players">) {
  return (
    <div className="space-y-8">
      <PageHeader>
        <PageHeaderHeading>
          <PageHeaderTitle>{metadata.title?.toString()}</PageHeaderTitle>
          <PageHeaderDescription>{metadata.description}</PageHeaderDescription>
        </PageHeaderHeading>
      </PageHeader>

      {children}
    </div>
  );
}
