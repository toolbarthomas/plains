/**
 * Processes all inserted CLI arguments within Plains.
 */
class Argv {
  constructor() {
    this.defaults = {
      serve: false,
      silent: false,
      verbose: false,
    };
  }

  /**
   * Get the given CLI arguments.
   *
   * @returns {Object} Object with CLI given arguments.
   */
  get args() {
    const { argv } = process;

    let args = {};

    // Make sure we have actual arguments defined.
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

    // Inherit any missing default argument.
    args = Object.assign(this.defaults, args);

    return args;
  }
}

module.exports = Argv;
