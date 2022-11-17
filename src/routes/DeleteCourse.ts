import { Request, Response, NextFunction } from "express";
import { logger } from "../Logger";
import { AppDataSource } from "../DataSource";
import { Course } from "../models/Course";
import { isInteger } from "../Utils";
import { Lesson } from "../models/Lesson";

export async function deleteCourseAndLessons(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    logger.debug(`Called deleteCourseAndLessons()`);

    const courseId = request.params.courseId;

    if (!isInteger(courseId)) {
      throw {
        error: "Bad Request",
        status: 400,
        message: `Could not extract course id ${courseId} from the request.`,
      };
    }

    await AppDataSource.manager.transaction(
      async (transactionEntityManager) => {
        await transactionEntityManager
          .createQueryBuilder()
          .delete()
          .from(Lesson)
          .where("courseId = :courseId", { courseId })
          .execute();

        await transactionEntityManager
          .createQueryBuilder()
          .delete()
          .from(Course)
          .where("id = :courseId", { courseId })
          .execute();
      }
    );

    response.status(200).json({
      message: `Course with id ${courseId} deleted successfully`,
    });
  } catch (error) {
    logger.error(`Error handling deleteCourseAndLessons()`);
    next(error);
  }
}
