"use client";

import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: VariantProps<typeof buttonVariants>["size"];
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

function PrimaryFlowButton({
  children,
  size,
  asChild = false,
  className,
  ...props
}: FlowButtonProps) {
  return (
    <div
      className={cn(
        "relative isolate w-fit overflow-hidden rounded-lg ring-2 ring-primary/60",
        className,
      )}
    >
      <Button
        size={size}
        asChild={asChild}
        className={cn(
          "relative rounded-lg border border-transparent bg-clip-padding text-shadow-xs duration-500 hover:bg-primary",
          size === "lg" && "text-base has-[>svg]:px-6",

          // After - Border gradient effect with rotation
          "after:mask-exclude after:absolute after:-inset-30 after:-z-1 after:rounded-[inherit] after:border after:border-inherit after:bg-origin-border after:transition-transform after:duration-500",

          "after:bg-[conic-gradient(from_90deg_at_50%_50%,var(--primary),var(--primary)_50%,rgba(0,0,0,15%)_51%_99%,var(--primary))] hover:after:rotate-180 dark:after:bg-[conic-gradient(from_90deg_at_50%_50%,var(--primary),var(--primary)_50%,rgba(0,0,0,30%)_51%_99%,var(--primary))]",
        )}
        {...props}
      >
        {children}
      </Button>
    </div>
  );
}

function SecondaryFlowButton({
  children,
  size,
  asChild = false,
  className,
  ...props
}: FlowButtonProps) {
  return (
    <div
      className={cn(
        "relative isolate w-fit overflow-hidden rounded-lg ring-2 ring-secondary/60",
        className,
      )}
    >
      <Button
        size={size}
        variant="secondary"
        asChild={asChild}
        className={cn(
          "relative rounded-lg border border-transparent bg-clip-padding text-shadow-xs duration-500 hover:bg-secondary",
          size === "lg" && "text-base has-[>svg]:px-6",

          // After - Border gradient effect with rotation
          "after:mask-exclude after:mask-clip-content after:absolute after:-inset-30 after:-z-1 after:rounded-[inherit] after:border after:border-inherit after:bg-origin-border after:transition-transform after:duration-500 after:[mask:linear-gradient(black,black),linear-gradient(black,black)]",

          "after:bg-[conic-gradient(from_90deg_at_50%_50%,var(--secondary),var(--secondary)_50%,rgba(0,0,0,15%)_51%_99%,var(--secondary))] hover:after:rotate-180 dark:after:bg-[conic-gradient(from_90deg_at_50%_50%,var(--secondary),var(--secondary)_50%,rgba(255,255,255,60%)_51%_99%,var(--secondary))]",
        )}
        {...props}
      >
        {children}
      </Button>
    </div>
  );
}

export { type FlowButtonProps, PrimaryFlowButton, SecondaryFlowButton };
