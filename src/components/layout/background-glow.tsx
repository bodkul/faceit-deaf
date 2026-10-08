/** A soft neutral spotlight and a grid that fade out below the fold. */
export function BackgroundGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden"
    >
      <div className="mask-[linear-gradient(to_bottom,black,transparent_85%)] absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[48px_48px] opacity-50" />
      <div className="absolute top-[-260px] left-1/2 h-[480px] w-[1000px] max-w-[160vw] -translate-x-1/2 rounded-full bg-foreground/[0.07] blur-[120px]" />
      <div className="absolute top-[-160px] left-1/2 h-[220px] w-[420px] max-w-[90vw] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[100px]" />
    </div>
  );
}
