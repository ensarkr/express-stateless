import { NextFunction, Request, Response } from "express";
import { cookieParser } from "../functions/cookie.js";
import { createDoubleCSRF } from "../functions/csrf.js";

// * verifies csrf tokens by checking rehashed version matches with hashed version
// * depending on type verify methods varies
const verifyDoubleSignedSubmit = (
  req: Request,
  res: Response,
  next: NextFunction,
  type: "user" | "guest"
) => {
  const cookies = cookieParser(req.headers.cookie);

  let doubleCSRFProps: Parameters<typeof createDoubleCSRF>;

  switch (type) {
    case "guest":
      {
        // * to send proper guest requests
        // * csrf_token_guest and x-csrf-token-hashed-guest must exist
        // * these both must set before sending request to server
        // * these values are returned by response on api/getCSRF endpoint

        if (
          !cookies.doesCookieExist("csrf_token_guest") ||
          req.headers["x-csrf-token-hashed-guest"] === undefined
        ) {
          res.status(400).json({ msg: "csrf tokens not set" }).end();
          return;
        }

        // * function props are set as "ENV" because type is guest
        doubleCSRFProps = [
          { type: "ENV" },
          cookies.getValue("csrf_token_guest") as string,
        ];
      }
      break;
    case "user":
      {
        // * to send proper user requests
        // * csrf_token_user and x-csrf-token-hashed-user must exist
        // * these both must set before sending request to server
        // * these values are returned by response on api/getCSRF endpoint
        if (
          !cookies.doesCookieExist("csrf_token_user") ||
          req.headers["x-csrf-token-hashed-user"] === undefined
        ) {
          res.status(400).json({ msg: "csrf tokens not set" }).end();
          return;
        }

        if (!cookies.doesCookieExist("jwt_token")) {
          res.status(400).json({ msg: "jwt_token not set" }).end();
          return;
        }

        // * function props are set as "JWT" because type is user
        doubleCSRFProps = [
          { type: "JWT", JWT: cookies.getValue("jwt_token") as string },
          cookies.getValue("csrf_token_user") as string,
        ];
      }
      break;
    default:
      return;
  }

  const { hashedCSRFToken: trueHashedCSRFToken } = createDoubleCSRF(
    ...doubleCSRFProps
  );

  // * check if csrf tokens tampered
  if (req.headers["x-csrf-token-hashed-" + type] === trueHashedCSRFToken) {
    next();
  } else res.status(400).json({ msg: "csrf token mismatch" }).end();
  return;
};

// * bottom two are might written as higher-order functions. But i did not want server to create new functions on every request
const verifyDoubleSignedSubmitGuest_MW = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return verifyDoubleSignedSubmit(req, res, next, "guest");
};

const verifyDoubleSignedSubmitUser_MW = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return verifyDoubleSignedSubmit(req, res, next, "user");
};

export { verifyDoubleSignedSubmitGuest_MW, verifyDoubleSignedSubmitUser_MW };
