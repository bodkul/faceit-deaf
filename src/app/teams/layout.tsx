import type { Metadata } from "next";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderTitle,
} from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Teams",
  description: "Browse teams and their rosters",
};

export default function TeamsLayout(props: LayoutProps<"/teams">) {
  return (
    <div className="space-y-8">
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
