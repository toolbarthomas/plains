const fs = require("fs");

const config = require("./config").init();
const message = require("./message");

module.exports = {
  /**
   * Use the Webpack configuration file if `PLAINS_ENVIRONMENT` constant is defined.
   * Webpack will try to load: `webpack.config.${PLAINS_ENVIRONMENT}.js if it excists.
   */
  getConfig() {
    let environment_config = `${process.cwd()}/webpack.config.${config.PLAINS_ENVIRONMENT.toLowerCase()}.js`;

    if (!fs.existsSync(environment_config)) {
      message.info(`The webpack configuration file for "${config.PLAINS_ENVIRONMENT}" could not been found.`);

      message.info(`Webpack will ignore the specific configuration for "${config.PLAINS_ENVIRONMENT}".`);

      message.info(`Be sure to create a Webpack configuration specific for "${config.PLAINS_ENVIRONMENT}".`);

      return {};
    }

    let webpackConfig = require(environment_config);

    if (typeof webpackConfig == "object" && Object.keys(webpackConfig).length > 0) {
      return webpackConfig;
    }
    else {
      message.info(`The defined configuration for "${config.PLAINS_ENVIRONMENT}" is not a valid configuration object for Webpack.`);

      message.info(`Webpack will ignore the specific configuration for ${config.PLAINS_ENVIRONMENT}.`);

      return {};
    }
  }
};
