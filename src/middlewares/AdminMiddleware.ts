import { Request, Response, NextFunction } from "express";
import { logger } from "../Logger";

export async function checkIfAdmin(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    logger.debug(`Called checkIfAdmin()`);
    const user = request["user"];

    if (!user?.isAdmin) {
      logger.error(`The user is not an admin, access denied.`);
      throw {
        error: "Forbidden",
        status: 403,
        message: "You have no access to this resource.",
      };
    }

    logger.debug(`The user is a valid admin, granting access.`);
    next();
  } catch (error) {
    logger.error(`Error handling checkIfAdmin()`);
    next(error);
  }
}
