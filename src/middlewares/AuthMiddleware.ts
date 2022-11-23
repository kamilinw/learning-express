import { Request, Response, NextFunction } from "express";
import { logger } from "../Logger";

const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

export async function checkIfAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    logger.debug(`Called checkIfAuthenticated()`);
    const authJwtToken = request.headers.authorization.replace("Bearer ", "");

    if (!authJwtToken) {
      throw {
        error: "Forbidden",
        status: 403,
        message: "The authentication JWT is not present, access denied!",
      };
    }

    checkJwtValidity(authJwtToken)
      .then((user) => {
        logger.info(`JWT successfully decoded: `, user);
        request["user"] = user;
        next();
      })
      .catch((err) => {
        err.error = "Forbidden";
        err.status = 403;
        logger.error(`Error handling checkIfAuthenticated()`);
        next(err);
      });
  } catch (error) {
    logger.error(`Error handling checkIfAuthenticated()`);
    next(error);
  }
}

async function checkJwtValidity(authJwtToken: string) {
  const user = await jwt.verify(authJwtToken, JWT_SECRET);
  return user;
}
