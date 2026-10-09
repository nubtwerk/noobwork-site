import { ADMIN_COOKIE } from "@/lib/challenge/admin";
import { redirectTo } from "@/lib/challenge/http";

export async function POST(request: Request) {
  const response = redirectTo(request, "/season/admin/challenge");
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
