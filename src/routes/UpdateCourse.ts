import { Request, Response, NextFunction } from "express";
import { logger } from "../Logger";
import { AppDataSource } from "../DataSource";
import { isInteger } from "../Utils";
import { Course } from "../models/Course";

export async function updateCourse(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    logger.debug(`Called updateCourse()`);
    const courseId = request.params.courseId;
    const changes = request.body;

    if (!isInteger(courseId)) {
      throw {
        error: "Bad Request",
        status: 400,
        message: `Could not extract course id ${courseId} from the request.`,
      };
    }

    const course = await AppDataSource.createQueryBuilder()
      .update(Course)
      .set(changes)
      .where("id = :courseId", { courseId })
      .execute();

    response.status(200).json({
      message: `Course ${courseId} was updated successfully.`,
    });
  } catch (error) {
    logger.error(`Error handling updateCourse()`);
    next(error);
  }
}
