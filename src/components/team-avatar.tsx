import { cn } from "cn";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TeamAvatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  return (
    <Avatar
      className={cn("size-9 shrink-0 rounded-lg after:rounded-lg", className)}
    >
      <AvatarImage className="rounded-lg" src={src ?? undefined} alt="" />
      <AvatarFallback className="rounded-lg bg-muted font-bold text-muted-foreground">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
