const fs = require("fs");

/**
 * Define the environment constants used by Plains.
 */
module.exports = (() => {
  const envPath = `${process.cwd()}/.env`;

  if (!fs.existsSync(envPath)) {
    fs.writeFile(envPath, "", "utf8", error => {
      if (error) {
        throw error;
      }

      console.info(
        `No environment ('.env') file has been defined. A fresh new copy has been made within: ${process.cwd()}`
      );

      return initEnvironment(envPath);
    });
  } else {
    return initEnvironment(envPath);
  }
})();

/**
 * Returns the environment configuration as an Object.
 *  Also defines fallback values for non defined environment constants.
 *
 * @param {String} envPath
 * @returns {Object}
 */
function initEnvironment(envPath) {
  const env = require("dotenv").config({
    path: envPath
  });

  /**
   * Validate the parsed environment file throw an exception if any errors.
   */
  if (env.error) {
    throw env.error;
  }

  /**
   * Define the configuration object before returning it.
   */
  const config = {};

  /**
   * Check if the process.env is actually set.
   */
  if (!process.env) {
    return config;
  }

  /**
   * Define the current environment for the application.
   *  Falls back to `production` if `PLAINS_ENVIRONMENT` is not defined.
   */
  config.PLAINS_ENVIRONMENT = process.env.ENVIRONMENT || "production";

  /**
   * Define the source directory for Plains.
   *  Falls back to `./src` if `PLAINS_SRC` is not defined.
   */
  config.PLAINS_SRC = (process.env.PLAINS_SRC || "./src").replace(/\/$/, "");

  /**
   * Define the destination directory for Plains.
   *  Falls back to `./dist` if `PLAINS_DIST` is not defined.
   */
  config.PLAINS_DIST = (process.env.PLAINS_DIST || "./dist").replace(/\/$/, "");

  /**
   * Define the default server-port for the development server.
   *  Falls back to `8080` if `PLAINS_SERVER_PORT` is not defined.
   */
  config.PLAINS_SERVER_PORT = process.env.PLAINS_SERVER_PORT || 8080;

  /**
   * Notify the user that the environment configration is loaded
   */
  console.info(`Environment configuration loaded from: ${envPath}`);

  return config;
}
