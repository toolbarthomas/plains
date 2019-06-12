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

    this.args = {};
  }

  /**
   * Return all defined CLI arguments from process.argv.
   *
   * @returns {Object} Object with defined CLI arguments.
   */
  getArguments() {
    const { argv } = process;

    if (argv[2]) {
      argv.slice(2).forEach(arg => {
        if (arg.indexOf('=') >= 0) {
          const value = String(arg.substring(arg.indexOf('=') + 1));
          const key = String(arg.split('=')[0]);

          // Convert values with true or false to an actual Boolean.
          switch (value.toLowerCase()) {
            case 'true':
              this.args[key] = true;
              break;
            case 'false':
              this.args[key] = false;
              break;
            default:
              this.args[key] = value;
              break;
          }
        } else {
          this.args[arg] = true;
        }
      });
    }

    // Inherit any missing default argument.
    const args = Object.assign(this.defaults, this.args);

    return args;
  }
}

module.exports = Argv;
