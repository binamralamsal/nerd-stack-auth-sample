import { api } from "@repo/api/server";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { env } from "#env";
import { parseCookies } from "#utils/parse-cookies";

export default async function middleware(request: NextRequest) {
  try {
    const refreshToken = cookies().get("refreshToken")?.value;
    const accessToken = cookies().get("accessToken")?.value;

    if (accessToken || !refreshToken) return NextResponse.next();

    const response = await api.auth.me.get({
      $headers: {
        Cookie: cookies().toString(),
      },
    });

    // 400 status code is sent if cookie signature doesn't match
    if (response.status === 400) {
      const redirectResponse = NextResponse.redirect(request.url);

      redirectResponse.headers.set(
        "Set-Cookie",
        `accessToken=; Max-Age=0; domain=${env.FRONTEND_DOMAIN}`
      );
      redirectResponse.headers.set(
        "Set-Cookie",
        `refreshToken=; Max-Age=0; domain=${env.FRONTEND_DOMAIN}`
      );

      return redirectResponse;
    }

    const { headers } = response as unknown as { headers: Headers };
    const responseCookie = headers.get("set-cookie");

    if (!responseCookie) throw new Error("No set-cookie header in response");

    const parsedCookies = parseCookies(responseCookie);
    const redirectResponse = NextResponse.redirect(request.url);

    redirectResponse.cookies.set(
      "accessToken",
      parsedCookies.accessToken?.value || "",
      parsedCookies.accessToken?.attributes
    );
    redirectResponse.cookies.set(
      "refreshToken",
      parsedCookies.refreshToken?.value || "",
      parsedCookies.refreshToken?.attributes
    );
    return redirectResponse;
  } catch (err) {
    console.error("Error in middleware:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};
