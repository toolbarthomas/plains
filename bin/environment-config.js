const fs = require('fs');
const path = require('path');
const env = require('dotenv');
const _ = require('lodash');

const message = require('./message');

/**
 * Define the global configuration based on the current environment.
 * Plains will use the default production configuration if no environment has been defined.
 */
module.exports = {
  init() {
    // Only set the environment configuration once.
    if (this.verifyConfig()) {
      return process.PLAINS || {};
    }

    // Define the default configuration for Plains
    const defaults = {
      PLAINS_ENVIRONMENT: 'production',
      PLAINS_SRC: path.resolve(process.cwd(), './src'),
      PLAINS_DIST: path.resolve(process.cwd(), './dist'),
      PLAINS_HOSTNAME: '127.0.0.1',
      PLAINS_PORT: 8080,
    };

    const envPath = `${process.cwd()}/.env`;

    /**
     * Check if an environment file exists or create one otherwise.
     * Insert the default environment configuration values within the new file.
     */
    if (!fs.existsSync(envPath)) {
      const defaultData = _.map(defaults, (value, key) => `# ${key}=${value}`).join('\n');

      fs.writeFileSync(envPath, defaultData, 'utf8');

      message.warning(
        `No environment ('.env') file has been defined. A fresh new copy has been created in: ${process.cwd()}`
      );
    }

    // Load the environment file defined within the current working directory.
    env.config({
      path: envPath,
    });

    // Validate the parsed environment file throw an exception if any errors.
    if (env.error) {
      message.error(env.error);
    }

    // Define the configuration object before returning it.
    const config = defaults || {};

    // Define any additional arguments from Node within the configuration.
    config.argv = this.defineArgs();

    // Check if the process.env is actually set.
    if (!process.env) {
      return config;
    }

    // Define the current environment for the application.
    config.PLAINS_ENVIRONMENT = process.env.PLAINS_ENVIRONMENT || defaults.PLAINS_ENVIRONMENT;

    // Define the source directory for Plains.
    config.PLAINS_SRC = path.resolve(process.cwd(), process.env.PLAINS_SRC || defaults.PLAINS_SRC);

    // Define the destination directory for Plains.
    config.PLAINS_DIST = path.resolve(
      process.cwd(),
      process.env.PLAINS_DIST || defaults.PLAINS_DIST
    );

    // Defines the hostname for the development server.
    const hostname = process.env.PLAINS_HOSTNAME || defaults.PLAINS_HOSTNAME;

    // Ensure the protocol & port number is removed.
    config.PLAINS_HOSTNAME = hostname.replace(/(^\w+:|^)\/\//, '');

    // Define the default port for the development server.
    config.PLAINS_PORT = process.env.PLAINS_PORT || defaults.PLAINS_PORT;

    config.PLAINS_SERVER_ADDRESS = `http://${config.PLAINS_HOSTNAME}:${config.PLAINS_PORT}`;

    /**
     * Make the Plains configuration global.
     * This also ensures that the configuration is only defined once.
     */
    process.PLAINS = config;

    // Loading the environment configuration.
    message.info(`Using environment configuration for ${config.PLAINS_ENVIRONMENT}...`);

    return config || {};
  },

  /**
   * Check if the configuration for Plains is already defined
   *
   * @returns {Boolean} Returns true if Plains is already configured.
   */
  verifyConfig() {
    if (!('PLAINS' in process)) {
      return false;
    }

    return process.PLAINS instanceof Object && process.PLAINS.constructor === Object;
  },

  /**
   * Define the aditional arguments from the given Node command within the global configuration.
   * Use the actual argument value if the given Node command has a value defined with
   * the equals sign.
   *
   * @return {Object} Returns an Object with the defined Node arguments and it's value.
   */
  defineArgs() {
    const args = {};

    if (process.argv.length >= 3) {
      process.argv.slice(2).forEach(arg => {
        // Check if the Node argument has a specific value.
        if (arg.indexOf('=') >= 0) {
          const value = String(arg.substring(arg.indexOf('=') + 1));
          const key = String(arg.split('=')[0]);

          // Convert values with true or false to an actual Boolean.
          switch (value.toLowerCase()) {
            case 'true':
              args[key] = true;
              break;
            case 'false':
              args[key] = false;
              break;
            default:
              args[key] = value;
              break;
          }
        } else {
          args[arg] = true;
        }
      });
    }

    return args;
  },
};
