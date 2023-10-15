import crypto from "crypto";
import { v4 as uuid4 } from "uuid";
import { decodeJWTPayload } from "./jwt.js";

type createDoubleCSRFT = (
  options:
    | {
        type: "JWT";
        JWT: string;
      }
    | { type: "ENV" },
  defaultCSRFToken?: string
) => {
  CSRFToken: string;
  hashedCSRFToken: string;
};

// * creates necessary csrf tokens to apply signed double-submit cookie method
// * if defaultCSRFToken given its uses that instead of creating new uuid (used for verifying)

const createDoubleCSRF: createDoubleCSRFT = (options, defaultCSRFToken) => {
  if (options.type === "ENV") {
    // * ENV type is for guest actions
    // * uses env variable as secretKey
    const secretKey = process.env.CSRF_SECRET_KEY as string;
    const CSRFToken = defaultCSRFToken || uuid4();

    const hashedCSRFToken = crypto
      .createHmac("sha256", secretKey)
      .update(CSRFToken)
      .digest("base64");

    return {
      CSRFToken,
      hashedCSRFToken,
    };
  } else {
    // if (options.type === "JWT")
    // * JWT type is for user actions
    // * uses some JWT properties plus environment as secretKey
    const JWTPayload = decodeJWTPayload(options.JWT);
    const secretKey = (JWTPayload.exp.toString() +
      JWTPayload.email +
      process.env.CSRF_SECRET_KEY) as string;
    const CSRFToken = defaultCSRFToken || uuid4();

    const hashedCSRFToken = crypto
      .createHmac("sha256", secretKey)
      .update(CSRFToken)
      .digest("base64");

    return {
      CSRFToken,
      hashedCSRFToken,
    };
  }
};

export { createDoubleCSRF };
