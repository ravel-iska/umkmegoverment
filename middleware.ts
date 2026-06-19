import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const protectedRoutes = ["/admin", "/kelola-toko"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (pathname.startsWith("/admin")) {
      const adminCookie = request.cookies.get("admin_session")?.value;
      const adminSession = await decrypt(adminCookie);

      if (pathname.startsWith("/admin/login")) {
        if (adminSession && adminSession.role === "Admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      } else {
        if (!adminSession || adminSession.role !== "Admin") {
          return NextResponse.redirect(new URL("/admin/login", request.url));
        }
      }
    }

    if (pathname.startsWith("/kelola-toko")) {
      const sellerCookie = request.cookies.get("session")?.value;
      const sellerSession = await decrypt(sellerCookie);

      if (!sellerSession || (sellerSession.role !== "Penjual" && sellerSession.role !== "Admin")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
