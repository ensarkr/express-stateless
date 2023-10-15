import { NextFunction, Request, Response } from "express";
import { processJWT } from "../functions/jwt.js";

// ! after this called server must only access jwt from locals not from cookies
// ! if you access it from cookies you possibility of using tampered JWT
// ! because Set-Cookie header has not processed by browser yet
const validateJWT_MW = (req: Request, res: Response, next: NextFunction) => {
  return processJWT(req, res, next, true);
};

// * it stop request process if user JWT does not exist or tampered
// ! after this called server must only access jwt from locals not from cookies
// ! but this function is not severe as validateJWT_MW because it does not proceed if jwt is tampered or non-existent
const userAuthorization_MW = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return processJWT(req, res, next, false);
};

export { validateJWT_MW, userAuthorization_MW };
