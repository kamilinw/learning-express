import { Request, Response, NextFunction } from "express";
import { logger } from "../Logger";
import { AppDataSource } from "../DataSource";
import { Course } from "../models/Course";

export async function createCourse(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    logger.debug(`Called createCourse()`);

    const courseDto = request.body;

    if (!courseDto) {
      throw {
        error: "Bad Request",
        status: 400,
        message: "Invalid course data.",
      };
    }

    const course = await AppDataSource.manager.transaction(
      "REPEATABLE READ",
      async (transactionEntityManager) => {
        const repository = transactionEntityManager.getRepository(Course);

        const result = await repository
          .createQueryBuilder("courses")
          .select("MAX(courses.seqNo)", "max")
          .getRawOne();

        const course = repository.create({
          ...courseDto,
          seqNo: (result?.max ?? 0) + 1,
        });

        await repository.save(course);
        return course;
      }
    );

    response.status(201).json({ course });
  } catch (error) {
    logger.error(`Error handling createCourse()`);
    next(error);
  }
}
