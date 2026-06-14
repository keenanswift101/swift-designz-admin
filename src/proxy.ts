import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

const SUBSCRIBE_SUBDOMAIN = "subscribe.swiftdesignz.co.za";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // Dedicated landing page subdomain — serve /subscribe at the root, bypassing auth.
  if (host === SUBSCRIBE_SUBDOMAIN || host.startsWith(`${SUBSCRIBE_SUBDOMAIN}:`)) {
    const url = request.nextUrl.clone();
    url.pathname = "/subscribe";
    return NextResponse.rewrite(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|pdf)$).*)",
  ],
};
