import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "plants_session";

function authSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 32) {
    return new TextEncoder().encode("dev-only-plants-auth-secret-32ch");
  }
  return new TextEncoder().encode(raw);
}

function adminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "joachim@noobwork.no").trim().toLowerCase();
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    return email === adminEmail();
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/plants/new" || pathname.startsWith("/plants/new/")) {
    if (!(await hasValidSession(request))) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  if (pathname.endsWith("/edit")) {
    if (!(await hasValidSession(request))) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/plants/new", "/plants/:id/edit"],
};
