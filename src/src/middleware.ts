import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GUEST_COOKIE = "se_user_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get(GUEST_COOKIE)) {
    const id = crypto.randomUUID();
    response.cookies.set(GUEST_COOKIE, id, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
