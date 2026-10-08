import { cn } from "cn";
import Image from "next/image";

import { getCountryFlagUrl } from "@/lib/country";

export function CountryFlag({
  code,
  className,
}: {
  code: string | null | undefined;
  className?: string;
}) {
  if (!code) return null;

  return (
    <Image
      className={cn("h-3 w-4 shrink-0 rounded-[2px] object-cover", className)}
      src={getCountryFlagUrl(code.toLowerCase(), 40)}
      width={16}
      height={12}
      alt={code.toUpperCase()}
      title={code.toUpperCase()}
    />
  );
}
