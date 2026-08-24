import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderTitle,
} from "@/components/page-header";

export const metadata = {
  title: "Player Rankings",
  description: "Player rankings for the DEAF community, ranked by FACEIT ELO",
};

export default function PlayersLayout(props: LayoutProps<"/players">) {
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
