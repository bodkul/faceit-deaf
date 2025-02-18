import { Leardboard } from "@/components/leardboard";

export default function Page() {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Leardboard</h2>
        <p className="text-base text-muted-foreground">
          FACEIT CS2 performance for the deaf community.
        </p>
      </div>
      <Leardboard />
    </>
  );
}
