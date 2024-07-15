import { api } from "@repo/api";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseCookies } from "@/utils/parse-cookies";

export default async function middleware(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken || (accessToken && !refreshToken))
      return NextResponse.next();

    const { headers } = (await api.auth.me.get({
      $headers: {
        Cookie: request.cookies.toString(),
      },
    })) as unknown as { headers: Headers };

    const responseCookie = headers.get("set-cookie");
    if (!responseCookie) throw new Error();

    const parsedCookies = parseCookies(responseCookie);
    if (responseCookie) {
      const response = NextResponse.redirect(request.url);

      response.cookies.set(
        "accessToken",
        parsedCookies.accessToken.value,
        parsedCookies.accessToken.attributes
      );
      response.cookies.set(
        "refreshToken",
        parsedCookies.refreshToken.value,
        parsedCookies.refreshToken.attributes
      );
      return response;
    }

    return NextResponse.next();
  } catch (err) {
    console.error(err);
    return NextResponse.next();
  }
}
