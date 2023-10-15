import { user } from "../app.js";
import crypto from "crypto";
import { Response, Request, NextFunction } from "express";
import { cookieParser, setCookieResponse } from "./cookie.js";

const createJWT = (user: user, expirationSecond: number) => {
  const issuer = "express";
  const subject = user.name;
  const issuedAt = Date.now();
  const expirationTime = issuedAt + expirationSecond;

  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const payload = {
    iss: issuer,
    sub: subject,
    iat: issuedAt,
    exp: expirationTime,
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const secretKey = process.env.JWT_SECRET_KEY as string;

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64"
  );

  const signatureInput = encodedHeader + "." + encodedPayload;

  // * creates HMAC with secret key
  // * add message to to HMAC function
  // * and finalize with digest
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(signatureInput)
    .digest("base64");

  const token = signatureInput + "." + signature;

  return token;
};

// * it checks signatures by rehashing again

const verifyJWT = (JWT: string) => {
  const secretKey = process.env.JWT_SECRET_KEY as string;

  const [encodedHeader, encodedPayload, signature] = JWT.split(".");

  const signatureInput = encodedHeader + "." + encodedPayload;
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(signatureInput)
    .digest("base64");

  if (
    signature === expectedSignature &&
    decodeJWTPayload(JWT).exp > Date.now()
  ) {
    return true;
  } else {
    return false;
  }
};

// * decodes jwt payload without verifying
// * should be verified before calling this function, if not it might return false info or gibberish

const decodeJWTPayload = (JWT: string) => {
  const [encodedHeader, encodedPayload, signature] = JWT.split(".");

  return JSON.parse(
    Buffer.from(encodedPayload, "base64").toString("utf-8")
  ) as {
    iss: string;
    sub: string;
    iat: number;
    exp: number;
    userId: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
};

// * if jwt does not exist does nothing
// * if jwt is exist but tampered, Set-Cookie header removes jwt_token cookie and sets locals jwt to undefined
// * if jwt is exist and verified, sets locals jwt

// * depending on continueProcess
// * if true, does not send response
// * if false, does send response excluding if its verified jwt_token
// * which means if you wanna proceed if only jwt exists and proper set it to false
// * or if you wanna only process JWT set it to true

const processJWT = (
  req: Request,
  res: Response,
  next: NextFunction,
  continueProcess: boolean
) => {
  const cookies = cookieParser(req.headers.cookie);

  if (cookies.doesCookieExist("jwt_token")) {
    const jwt_token = cookies.getValue("jwt_token") as string;

    if (verifyJWT(jwt_token)) {
      console.log("jwt is verified");
      res.locals.jwt = {
        payload: decodeJWTPayload(jwt_token),
        token: jwt_token,
      };
      next();
      return;
    } else {
      console.log("jwt is tampered");
      res.locals.jwt = undefined;
      setCookieResponse(
        res,
        "jwt_token",
        "null",
        `SameSite=strict; HttpOnly; Secure; Max-Age=0`
      );
      if (continueProcess) {
        console.log("jwt check passed");
        next();
        return;
      } else {
        res.status(400).json({ msg: "tampered jwt token" }).end();
        return;
      }
    }
  } else {
    if (continueProcess) {
      console.log("jwt non existent");
      next();
      return;
    } else {
      res.status(200).json({ msg: "no jwt token" }).end();
      return;
    }
  }
};

export { createJWT, verifyJWT, decodeJWTPayload, processJWT };
