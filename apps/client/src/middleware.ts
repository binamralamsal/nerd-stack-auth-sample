import { api } from "@repo/api/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseCookies } from "#utils/parse-cookies";

export default async function middleware({ url }: NextRequest) {
  try {
    const refreshToken = cookies().get("refreshToken")?.value;
    const accessToken = cookies().get("accessToken")?.value;

    if (accessToken || !refreshToken) return NextResponse.next();

    const response = await api.auth.me.get({
      $headers: {
        Cookie: cookies().toString(),
      },
    });
    const { headers } = response as unknown as { headers: Headers };

    const responseCookie = headers.get("set-cookie");

    if (!responseCookie) throw new Error("No set-cookie header in response");

    const parsedCookies = parseCookies(responseCookie);
    const redirectResponse = NextResponse.redirect(url);

    redirectResponse.cookies.set(
      "accessToken",
      parsedCookies.accessToken.value,
      parsedCookies.accessToken.attributes
    );
    redirectResponse.cookies.set(
      "refreshToken",
      parsedCookies.refreshToken.value,
      parsedCookies.refreshToken.attributes
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
