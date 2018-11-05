const fs = require("fs");
const path = require("path");

const message = require("./message");

/**
 * Define the environment constants used by Plains.
 */
module.exports = {

  /**
   * Define the current environment for Plains. An environment file will be
   * created if there is no dotenv file.
   */
  init() {
    // Only set the configuration during the first init.
    if (this._verifyConfig()) {
      return process.PLAINS || {};
    }

    const envPath = `${process.cwd()}/.env`;

    // Check if the environment has been created, create one otherwise.
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, "", "utf8");

      message.warning(`No environment ('.env') file has been defined. A fresh new copy has been created in: ${process.cwd()}`);
    }

    // Default configuration for Plains
    const defaults = {
      PLAINS_ENVIRONMENT: "production",
      PLAINS_SRC: path.resolve(process.cwd(), "./src"),
      PLAINS_DIST: path.resolve(process.cwd(), "./dist"),
      PLAINS_SERVER_PORT: 8080,
    };

    // Load the environment file defined within the current working directory.
    const env = require("dotenv").config({
      path: envPath
    });

    // Validate the parsed environment file throw an exception if any errors.
    if (env.error) {
      throw env.error;
    }

    // Define the configuration object before returning it.
    const config = defaults || {};

    // Check if the process.env is actually set.
    if (!process.env) {
      return config;
    }

    // Define the current environment for the application.
    config.PLAINS_ENVIRONMENT = process.env.PLAINS_ENVIRONMENT || defaults.PLAINS_ENVIRONMENT;

    // Define the source directory for Plains.
    config.PLAINS_SRC = path.resolve(process.cwd(), (process.env.PLAINS_SRC || defaults.PLAINS_SRC));

    // Define the destination directory for Plains.
    config.PLAINS_DIST = path.resolve(process.cwd(), (process.env.PLAINS_DIST || defaults.PLAINS_DIST));

    // Define the default server-port for the development server.
    config.PLAINS_SERVER_PORT = process.env.PLAINS_SERVER_PORT || 8080;

    // Mark Plains as enabled since the configuration has been defined.
    process.PLAINS = config;

    // Notify the user that the environment configration is loaded
    message.success(`Environment configuration loaded from: ${envPath}`);

    return config || {};
  },

  /**
   * Check if the configuration for Plain is already defined
   *
   * @returns {Boolean} Returns true if Plains is already configured.
   */
  _verifyConfig() {
    if (!'PLAINS' in process) {
      return false;
    }

    if (process.PLAINS instanceof Object && process.PLAINS.constructor === Object) {
      return true;
    }
    else {
      return false;
    }
  }
};
