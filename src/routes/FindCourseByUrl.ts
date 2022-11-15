import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../models/course";
import { logger } from "../logger";
import { Lesson } from "../models/lesson";

export async function findCourseByUrl(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    logger.debug(`Called findCourseByUrl()`);

    const courseUrl = request.params.courseUrl;

    if (!courseUrl) {
      throw {
        error: "Bad Request",
        status: 400,
        message: "Could not extract course url from the request.",
      };
    }

    const course = await AppDataSource.getRepository(Course).findOneBy({
      url: courseUrl,
    });

    if (!course) {
      const message = `Could not find a course with url ${courseUrl}`;
      logger.error(message);
      throw {
        error: "Not Found",
        status: 404,
        message,
      };
    }

    const totalLessons = await AppDataSource.getRepository(Lesson)
      .createQueryBuilder("lessons")
      .where("lessons.course = :courseId", {
        courseId: course.id,
      })
      .getCount();

    response.status(200).json({
      course,
      totalLessons,
    });
  } catch (error) {
    logger.error(`Error handling findCourseByUrl()`);
    next(error);
  }
}
