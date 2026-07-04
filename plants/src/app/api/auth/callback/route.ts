import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  getAppUrl,
  verifyMagicLinkToken,
} from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const next = searchParams.get("next") ?? "/";

  if (!token) {
    return NextResponse.redirect(`${getAppUrl()}/login?error=missing_token`);
  }

  const verified = await verifyMagicLinkToken(token);
  if (!verified) {
    return NextResponse.redirect(`${getAppUrl()}/login?error=invalid_token`);
  }

  const sessionToken = await createSessionToken(verified.email);
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const response = NextResponse.redirect(`${getAppUrl()}${safeNext}`);
  response.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
