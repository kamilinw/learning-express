import * as dotenv from "dotenv";

const result = dotenv.config();
if (result.error) {
  console.log(`Error loading environment variables, aborting.`);
  process.exit(1);
}

import "reflect-metadata";
import * as express from "express";
import { logger } from "./logger";
import { root } from "./routes/root";
import { isIntiger } from "./utils";
import { AppDataSource } from "./data-source";

const app = express();

function setupExpress() {
  app.route("/").get(root);
}

function startServer() {
  let port: number;
  const portEnv = process.env.PORT;
  const portArg = process.argv[2];

  if (isIntiger(portEnv)) {
    port = parseInt(portEnv);
  }

  if (!port && isIntiger(portArg)) {
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
