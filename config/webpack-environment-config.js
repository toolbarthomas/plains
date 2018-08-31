const fs = require("fs");

module.exports = () => {
  let environment_name = process.env.ENVIRONMENT || "production";
  let environment_config = `${process.cwd()}/webpack.config.${environment_name.toLowerCase()}.js`;

  if (!fs.existsSync(environment_config)) {
    console.info(
      `The webpack configuration file for ${environment_name} could not been found.`
    );

    console.info(
      `Webpack will ignore the specific configuration for ${environment_name}.`
    );

    console.info(
      `Be sure to create a Webpack configuration specific for ${environment_name}.`
    );

    return {};
  }

  let config = require(environment_config);

  if (typeof config == "object" && Object.keys(config).length > 0) {
    return config;
  } else {
    console.info(
      `The defined configuration for "${environment_config}" is not a valid configuration object for Webpack.`
    );

    console.info(
      `Webpack will ignore the specific configuration for ${environment_name}.`
    );

    return {};
  }
};
