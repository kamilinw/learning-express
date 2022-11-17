import { Request, Response, NextFunction } from "express";
import { logger } from "../Logger";
import { AppDataSource } from "../DataSource";
import { Course } from "../models/Course";

export async function getAllCourses(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    logger.debug(`Called getAllCourses()`);
    const courses = await AppDataSource.getRepository(Course)
      .createQueryBuilder("courses")
      .orderBy("courses.seqNo")
      .getMany();

    response.status(200).json({ courses });
  } catch (error) {
    logger.error(`Error handling getAllCourses()`);
    next(error);
  }
}
