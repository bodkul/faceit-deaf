import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Extract the base domain from NEXT_PUBLIC_BASE_URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const rootDomain = new URL(baseUrl).host;

  // Get hostname from headers and normalize it
  let hostname = req.headers
    .get("x-forwarded-host")!
    .replace(".localhost:3000", `.${rootDomain}`);

  // Special case for Vercel preview deployment URLs
  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.${rootDomain}`;
  }

  // Get the pathname and query parameters
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // Rewrite for hub pages
  if (hostname === `hub.${rootDomain}`) {
    return NextResponse.rewrite(
      new URL(`/hub${path === "/" ? "" : path}`, req.url),
    );
  }

  return NextResponse.next();
}
