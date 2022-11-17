import { Request, Response, NextFunction } from "express";
import { logger } from "../Logger";
import { AppDataSource } from "../DataSource";
import { Course } from "../models/Course";
import { Lesson } from "../models/Lesson";
import { isInteger } from "../Utils";

export async function findLessonsByCourse(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    logger.debug(`Called findLessonsByCourse()`);

    const courseId = request.params.courseId,
      query = request.query as any,
      pageNumber = query?.pageNumber ?? "0",
      pageSize = query?.pageSize ?? "3";
    console.log(typeof pageNumber, typeof pageSize, typeof courseId);
    if (!isInteger(courseId)) {
      throw {
        error: "Bad Request",
        status: 400,
        message: `Could not extract course id ${courseId} from the request.`,
      };
    }

    if (!isInteger(pageNumber)) {
      throw {
        error: "Bad Request",
        status: 400,
        message: `Invalid page number ${pageNumber}`,
      };
    }

    if (!isInteger(pageSize)) {
      throw {
        error: "Bad Request",
        status: 400,
        message: `Invalid page size ${pageSize}`,
      };
    }

    const lessons = await AppDataSource.getRepository(Lesson)
      .createQueryBuilder("lessons")
      .where("lessons.course = :courseId", {
        courseId: courseId,
      })
      .orderBy("lessons.seqNo")
      .skip(pageNumber * pageSize)
      .take(pageSize)
      .getMany();

    response.status(200).json({
      lessons,
    });
  } catch (error) {
    logger.error(`Error handling findLessonsByCourse()`);
    next(error);
  }
}
