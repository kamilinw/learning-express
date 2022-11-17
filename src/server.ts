import * as dotenv from "dotenv";

const result = dotenv.config();
if (result.error) {
  console.log(`Error loading environment variables, aborting.`);
  process.exit(1);
}

import "reflect-metadata";
import * as express from "express";
import { logger } from "./Logger";
import { root } from "./routes/Root";
import { isInteger } from "./Utils";
import { AppDataSource } from "./DataSource";
import { deleteCourseAndLessons } from "./routes/DeleteCourse";
import { getAllCourses } from "./routes/GetAllCourses";
import { defaultErrorHandler } from "./middlewares/DefaultErrorHandler";
import { findCourseByUrl } from "./routes/FindCourseByUrl";
import { findLessonsByCourse } from "./routes/FindLessonsByCourse";
import { updateCourse } from "./routes/UpdateCourse";
import { createCourse } from "./routes/CreateCourse";

const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

function setupExpress() {
  app.use(cors({ origin: true }));

  app.use(bodyParser.json());

  app.route("/").get(root);

  app.route("/api/courses").get(getAllCourses);

  app.route("/api/courses/:courseId").delete(deleteCourseAndLessons);

  app.route("/api/courses/:courseUrl").get(findCourseByUrl);

  app.route("/api/courses/:courseId/lessons").get(findLessonsByCourse);

  app.route("/api/courses/:courseId").patch(updateCourse);

  app.route("/api/courses").post(createCourse);

  app.use(defaultErrorHandler);
}

function startServer() {
  let port: number;
  const portEnv = process.env.PORT;
  const portArg = process.argv[2];

  if (isInteger(portEnv)) {
    port = parseInt(portEnv);
  }

  if (!port && isInteger(portArg)) {
    port = parseInt(portArg);
  }

  if (!port) {
    port = 9000;
  }
  app.listen(port, () => {
    logger.info(`HTTP Server is now running at http://localhost:${port}/`);
  });
}

AppDataSource.initialize()
  .then(() => {
    logger.info(`The datasource has been initialized successfully.`);
    setupExpress();
    startServer();
  })
  .catch((error) => {
    logger.error(`Error during datasource initialization.`, error);
    process.exit(1);
  });
