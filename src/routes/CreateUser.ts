import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../DataSource";
import { logger } from "../Logger";
import { User } from "../models/User";
import { calculatePasswordHash } from "../Utils";

const crypto = require("crypto");

export async function createUser(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    logger.debug(`Called createUser()`);
    const { email, password, pictureUrl, isAdmin } = request.body;

    if (!email) {
      throw {
        error: "Bad Request",
        status: 400,
        message: "Could not extract email from the request.",
      };
    }

    if (!password) {
      throw {
        error: "Bad Request",
        status: 400,
        message: "Could not extract password from the request.",
      };
    }

    const repository = AppDataSource.getRepository(User);

    const dbUser = await repository
      .createQueryBuilder("users")
      .where("email = :email", { email })
      .getOne();

    if (dbUser) {
      const message = `User with email ${email} already exists!.`;
      logger.error(message);
      throw {
        error: "Conflict",
        status: 409,
        message,
      };
    }

    const passwordSalt = crypto.randomBytes(64).toString("hex");
    const passwordHash = await calculatePasswordHash(password, passwordSalt);

    const newUser = repository.create({
      email,
      passwordHash,
      passwordSalt,
      pictureUrl,
      isAdmin,
    });

    const user = await AppDataSource.manager.save(newUser);
    logger.info(`User ${email} has been created`);

    response.status(201).json({
      email,
      pictureUrl,
      isAdmin,
    });
  } catch (error) {
    logger.error(`Error handling createUser()`);
    next(error);
  }
}
