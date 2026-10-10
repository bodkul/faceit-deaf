import { IconInfoCircle } from "@tabler/icons-react";

const NEW_DOMAIN = "csdeaf.vercel.app";
// The notice is shown through November 30.
const HIDE_AFTER = new Date("2026-12-01T00:00:00Z");

export function DomainNotice() {
  if (new Date() >= HIDE_AFTER) return null;

  return (
    <div className="w-full border-warning/20 border-y bg-warning/10">
      <div className="mx-auto flex w-full max-w-6xl items-start gap-2 px-4 py-2.5 text-muted-foreground text-sm">
        <IconInfoCircle size={16} className="mt-0.5 shrink-0 text-warning" />
        <p>
          The domain csdeaf.pro expires on October 20 and won&apos;t be renewed.
          The site now lives at{" "}
          <a
            href={`https://${NEW_DOMAIN}`}
            className="font-medium text-foreground underline underline-offset-2 hover:text-warning"
          >
            {NEW_DOMAIN}
          </a>
          . Please update your bookmarks.
        </p>
      </div>
    </div>
  );
}
