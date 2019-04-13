const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const prettyHrtime = require('pretty-hrtime');

const Builder = require('./lib/Builder/Index');
const Logger = require('./lib/Logger');

class Plains {
  constructor() {
    this.args = {};
    this.env = {};
    this.builder = {};
    this.time = process.hrtime();

    this.init();
  }

  init() {
    this.defineLogger();
    this.defineArgs();
    this.defineEnvironmentConfig();
    this.defineBuilder();
  }

  /**
   * Output the elapsed runtime of Plains.
   */
  outputTime() {
    const diff = process.hrtime(this.time);

    return prettyHrtime(diff);
  }

  /**
   * Define the logger
   */
  defineLogger() {
    this.log = Logger;
  }

  /**
   * Define the CLI arguments for Plains.
   */
  defineArgs() {
    const { argv } = process;

    const defaultArguments = {
      serve: false,
      silent: false,
      verbose: false,
    };

    // Don't define the environment specific variables twice.
    if (this.args instanceof Object && Object.keys(this.args).length > 0) {
      return;
    }

    const args = {};

    if (argv.length > 2) {
      argv.slice(2).forEach(arg => {
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

    this.args = Object.assign(defaultArguments, args);
  }

  /**
   * Define environment specific configuration from the optional dotenv file.
   */
  defineEnvironmentConfig() {
    const defaultConfig = {
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

    // Don't define the environment specific variables twice.
    if (this.env instanceof Object && Object.keys(this.env).length > 0) {
      return;
    }

    // Prepare the actual environment configuration.
    const config = {};

    // Define the path to the dotenv environment file.
    const source = path.resolve(process.cwd(), '.env');

    let environmentConfig = {
      parsed: {}
    };

    // Use the default configuration if the dotenv file doesn't exists.
    if (!fs.existsSync(source)) {
      Object.assign(config, defaultConfig);
    }
    else {
      environmentConfig = dotenv.config({
        path: source,
      });

      if (environmentConfig.error) {
        throw new Error(environmentConfig.error);
      }
    }

    // Define any default value for any missing custom variable.
    Object.keys(defaultConfig).forEach(key => {
      if (!environmentConfig.parsed || !environmentConfig.parsed[key]) {
        config[key] = defaultConfig[key];
      }
    });

    // Define the actual environment configuration.
    this.env = Object.assign(config, environmentConfig.parsed);

    // Define DEVELOPMENT_MODE flag if environment is set to `development`.
    this.env.PLAINS_DEVMODE = (this.env.PLAINS_ENVIRONMENT === 'development');
  }

  /**
   * Define the resource builder for Plains.
   */
  defineBuilder() {
    this.builder = new Builder(
      this.args,
      this.env
    );

    this.builder.define();
  }
}

module.exports = new Plains();
