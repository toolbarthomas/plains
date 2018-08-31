const fs = require("fs");

module.exports = () => {
  const environment_path = `${process.cwd()}/.env`;

  if (!fs.existsSync(environment_path)) {
    fs.writeFile(environment_path, "", "utf8", error => {
      if (error) {
        throw error;
      }

      console.info(
        `No environment ('.env') file has been defined. A fresh new copy has been made within: ${process.cwd()}`
      );

      parseEnvironment(environment_path);
    });
  } else {
    parseEnvironment(environment_path);
  }
};

function parseEnvironment(environment_path) {
  const config = require("dotenv").config({
    path: environment_path
  });

  /**
   * Validate the parsed environment file throw an exception if any errors
   */
  if (config.error) {
    throw config.error;
  }

  /**
   * Define the current environment for the application.
   *  Fallback to `production` if no `ENVIRONMENT` key is present.
   */
  process.env.ENVIRONMENT = process.env.ENVIRONMENT || "production";

  /**
   * Define the default path we use during development.
   *  Fallback to `./src` if there is no `SRC` variable.
   */
  process.env.SRC = process.env.SRC || "./src";

  /**
   * Define the default path we use during development.
   *  Fallback to `./dist` if there is no `DIST` variable.
   */
  process.env.DIST = process.env.DIST || "./dist";

  /**
   * Define the default port number for our development server.
   *  Use port `8080` if there is no `PORT` variable.
   */
  process.env.PORT = process.env.PORT || 8080;

  /**
   * Notify the user that the environment configration is loaded
   */
  console.info(`Environment configuration loaded from: ${environment_path}`);
}
