import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderTitle,
} from "@/components/layout/page-header";

export default function ProfileLayout({ children }: LayoutProps<"/profile">) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader>
        <PageHeaderHeading>
          <PageHeaderTitle>Account</PageHeaderTitle>
          <PageHeaderDescription>
            Linked accounts for your csdeaf profile.
          </PageHeaderDescription>
        </PageHeaderHeading>
      </PageHeader>

      {children}
    </div>
  );
}
