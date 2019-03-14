const _ = require('lodash');
const env = require('dotenv');
const fs = require('fs');
const path = require('path');

const Logger = require('./utils/Logger');

class Plains {
  constructor() {
    this.args = Plains.defineArguments();
    this.env = Plains.defineEnvironment();
  }

  /**
   * Define the command-line arguments from the running Node process.
   */
  static defineArguments() {
    const { argv } = process;

    const defaults = {
      serve: false,
      silent: false,
      verbose: false,
    };

    if (process.argv.length < 3) {
      return defaults;
    }

    const options = {};

    argv.slice(2).forEach(argument => {
      if (argument.indexOf('=') >= 0) {
        const value = String(argument.substring(argument.indexOf('=') + 1));
        const key = String(argument.split('=')[0]);

        // Convert values with true or false to an actual Boolean.
        switch (value.toLowerCase()) {
          case 'true':
            options[key] = true;
            break;
          case 'false':
            options[key] = false;
            break;
          default:
            options[key] = value;
            break;
        }
      } else {
        options[argument] = true;
      }
    });

    return Object.assign(defaults, options);
  }

  /**
   * Define the environment specific configuration.
   */
  static defineEnvironment() {
    const defaults = {
      PLAINS_ENVIRONMENT: 'production',
      PLAINS_SRC: './src',
      PLAINS_DIST: './dist',
      PLAINS_PACKAGE_PATH: './node_modules',
      PLAINS_HOSTNAME: '127.0.0.1',
      PLAINS_PORT: 8080,
      PLAINS_CSS_MODULES: true,
      PLAINS_BASE_PATH: 'base',
      PLAINS_TEMPLATES_PATH: 'templates',
      PLAINS_RESOURCES_DIRNAME: 'resources',
    };

    // Prevents the config from being set again.
    if ('PLAINS' in process) {
      return process.PLAINS;
    }

    // Stores the optional environment variables.
    let config = {};

    // Define the source of the dotenv file.
    const source = path.resolve(process.cwd(), '.env');

    if (!fs.existsSync(source)) {
      if (Plains.defineArguments().args.verbose) {
        Logger.warning(
          'The optional environment file is not defined, the default configuration will be used.'
        );
      }

      config = defaults;
    }

    const envObject = env.config({
      path: source,
    });

    if (envObject.error) {
      Logger.error(envObject.error);
    }

    Logger.info('Defining the environment configuration...');

    /**
     * Check if the default configuration keys are actually set from the found
     * dotenv environment file.
     */
    _.forEach(defaults, (value, key) => {
      if (!envObject.parsed[key]) {
        if (this.args && this.args.verbose) {
          Logger.warning(`Using default configuration value for ${key}`);
        }

        envObject.parsed[key] = value;
      }
    });

    /**
     * Merge the parsed environment variables & config defaults to use within
     * the workflow.
     */
    _.merge(config, envObject.parsed);

    // Make sure the source & destination paths are absolute
    const absolutePaths = ['PLAINS_SRC', 'PLAINS_DIST', 'PLAINS_PACKAGE_PATH'];

    absolutePaths.forEach(currentPath => {
      config[currentPath] = path.resolve(process.cwd(), config[currentPath]);
    });

    Logger.success(`Environment configuration defined for ${process.env.PLAINS_ENVIRONMENT}!`);

    // Make the config global.
    process.PLAINS = { config };

    return config;
  }
}

module.exports = new Plains();
