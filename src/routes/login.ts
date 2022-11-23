import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../DataSource";
import { logger } from "../Logger";
import { User } from "../models/User";
import { calculatePasswordHash } from "../Utils";

const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

export async function login(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    logger.debug(`Called login()`);

    const { email, password } = request.body;

    if (!email || !password) {
      throw {
        error: "Unauthorized",
        status: 401,
        message: "Could not extract username and password from request",
      };
    }

    const user = await AppDataSource.getRepository(User)
      .createQueryBuilder("users")
      .where("email = :email", { email })
      .getOne();

    if (!user) {
      throw {
        error: "Unauthorized",
        status: 401,
        message: "Invalid username or password!",
      };
    }

    const loginPasswordHash = await calculatePasswordHash(
      password,
      user.passwordSalt
    );

    if (loginPasswordHash !== user.passwordHash) {
      throw {
        error: "Unauthorized",
        status: 401,
        message: "Invalid username or password!",
      };
    }

    const { id, pictureUrl, isAdmin } = user;
    const jwtPayload = {
      userId: id,
      email,
      isAdmin,
    };

    const authJwtToken = await jwt.sign(jwtPayload, JWT_SECRET);

    response.status(200).json({
      user: {
        email,
        pictureUrl,
        isAdmin,
      },
      authJwtToken: "Bearer " + authJwtToken,
    });
  } catch (error) {
    logger.error(`Error handling login()`);
    next(error);
  }
}
