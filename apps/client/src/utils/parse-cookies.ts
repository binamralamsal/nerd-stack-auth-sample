interface CookieAttributes {
  maxAge?: number;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
}

interface Cookie {
  value: string;
  attributes: CookieAttributes;
}

type ParsedCookies = Record<string, Cookie | undefined>;

export function parseCookies(cookieString: string): ParsedCookies {
  return cookieString.split(", ").reduce((acc: ParsedCookies, cookie) => {
    const [nameValue, ...attributes] = cookie.split("; ");
    const [name, value] = nameValue.split("=");

    const cookieAttributes = attributes.reduce(
      (attrAcc: CookieAttributes, attr) => {
        const [key, attrValue] = attr.split("=");
        switch (key.toLowerCase()) {
          case "max-age":
            attrAcc.maxAge = Number(attrValue);
            break;
          case "domain":
            attrAcc.domain = attrValue;
            break;
          case "path":
            attrAcc.path = attrValue;
            break;
          case "httponly":
            attrAcc.httpOnly = true;
            break;
          case "secure":
            attrAcc.secure = true;
            break;
          case "samesite":
            attrAcc.sameSite = attrValue as "lax" | "strict" | "none";
            break;
        }
        return attrAcc;
      },
      {}
    );

    acc[name] = { value, attributes: cookieAttributes };
    return acc;
  }, {});
}
