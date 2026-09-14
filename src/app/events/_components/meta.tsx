import type { Icon as TablerIcon } from "@tabler/icons-react";

export function Meta({
  icon: Icon,
  children,
}: {
  icon: TablerIcon;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon size={16} />
      <span>{children}</span>
    </span>
  );
}
