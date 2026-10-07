import {
  PageHeader,
  PageHeaderHeading,
  PageHeaderTitle,
} from "@/components/layout/page-header";

export default function ProfileLayout({ children }: LayoutProps<"/profile">) {
  return (
    <div className="flex flex-col space-y-6">
      <PageHeader>
        <PageHeaderHeading>
          <PageHeaderTitle>Profile</PageHeaderTitle>
        </PageHeaderHeading>
      </PageHeader>

      {children}
    </div>
  );
}
