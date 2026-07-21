import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";
import { headers } from "next/headers";

export async function proxy(request: NextRequest) {
  //console.log("proxy ejecutandose", request.nextUrl.pathname)

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  //console.log("sesion: ", session)
  const pathname = request.nextUrl.pathname;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
