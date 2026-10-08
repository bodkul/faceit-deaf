import type { Metadata } from "next";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderTitle,
} from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Teams",
  description: "Deaf CS2 teams, their rosters and results.",
};

export default function TeamsLayout(props: LayoutProps<"/teams">) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <PageHeaderHeading>
          <PageHeaderTitle>{metadata.title?.toString()}</PageHeaderTitle>
          <PageHeaderDescription>{metadata.description}</PageHeaderDescription>
        </PageHeaderHeading>
      </PageHeader>

      {props.children}
    </div>
  );
}
