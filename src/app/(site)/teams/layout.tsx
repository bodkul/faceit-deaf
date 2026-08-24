import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderTitle,
} from "@/components/page-header";

export const metadata = {
  title: "Teams",
  description: "Browse teams and their rosters",
};

export default function TeamsLayout(props: LayoutProps<"/teams">) {
  return (
    <div className="space-y-8">
      <PageHeader>
        <PageHeaderHeading>
          <PageHeaderTitle>{metadata.title}</PageHeaderTitle>
          <PageHeaderDescription>{metadata.description}</PageHeaderDescription>
        </PageHeaderHeading>
      </PageHeader>

      {props.children}
    </div>
  );
}
