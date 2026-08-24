import { PageHeader, PageHeaderTitle } from "@/components/page-header";

export default function ProfileLayout({ children }: LayoutProps<"/profile">) {
  return (
    <div className="flex flex-col space-y-6">
      <PageHeader>
        <PageHeaderTitle>Profile</PageHeaderTitle>
      </PageHeader>

      {children}
    </div>
  );
}
