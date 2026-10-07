import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * Checks a shared secret sent in `header`. When the secret env var is not
 * configured the check is skipped, so the route keeps working until the
 * secret is set up on both sides.
 */
export function isAuthorized(
  request: Request,
  header: string,
  expected: string | undefined,
) {
  if (!expected) return true;
  const value = request.headers.get(header);
  return value !== null && safeEqual(value, expected);
}
