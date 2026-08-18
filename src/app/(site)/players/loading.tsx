import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex h-96 items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}
