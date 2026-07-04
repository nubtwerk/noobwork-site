import { NextResponse } from "next/server";
import { SESSION_COOKIE, getAppUrl } from "@/lib/auth";

function logoutResponse() {
  const response = NextResponse.redirect(`${getAppUrl()}/`, 303);
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function POST() {
  return logoutResponse();
}

export async function GET() {
  return logoutResponse();
}
