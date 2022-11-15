import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export function defaultErrorHandler(
  error,
  request: Request,
  response: Response,
  next: NextFunction
) {
  logger.error(`Default error handler triggered; reason: `, error);

  if (response.headersSent) {
    logger.error(
      `Response was already written, delegating to build-in Express error handler`
    );
    return next(error);
  }

  response.status(500).json({
    status: "error",
    code: 500,
    message: "Default error handling triggered, check logs.",
  });
}
