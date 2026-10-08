import { NotFoundState } from "@/components/not-found-state";

export default function NotFound() {
  return (
    <NotFoundState
      title="Page not found"
      description="This page doesn't exist or has moved."
    />
  );
}
