import { Response } from "express";

type cookieObjectT = {
  doesCookieExist: (key: string) => boolean;
  getValue: (key: string) => string | null;
  values: Record<string, string>;
};

type cookieParserT = (cookieString: string | undefined) => cookieObjectT;

// * creates cookies object for accessing all cookies in request header
// * get request.header.cookies as input

const cookieParser: cookieParserT = (cookieString) => {
  const cookieValues: Record<string, string> = {};

  if (cookieString === undefined) {
    return { values: {}, getValue: () => null, doesCookieExist: () => false };
  }

  const cookieStringArray = cookieString.split(";");

  cookieStringArray.map((e) => {
    cookieValues[e.split("=")[0].trim()] = e
      .slice(e.indexOf("=") + 1, e.length)
      .trim();
  });

  const doesCookieExist = (key: string) => {
    return Object.keys(cookieValues).includes(key);
  };

  const getValue = (key: string) => {
    if (doesCookieExist(key)) {
      return cookieValues[key];
    } else return null;
  };

  return {
    values: cookieValues,
    doesCookieExist,
    getValue,
  };
};

// * adds new cookies Set-Cookie header in responses without removing existing ones
const setCookieResponse = (
  res: Response,
  key: string,
  value: string,
  options: string
) => {
  const existingCookies = res.getHeader("Set-Cookie") as undefined | string[];

  const extraCookie = key + "=" + value + ";" + options;
  res.setHeader(
    "Set-Cookie",
    existingCookies !== undefined
      ? [...existingCookies, extraCookie]
      : [extraCookie]
  );
  console.log("cookie added", key);
};

export { cookieParser, setCookieResponse };
