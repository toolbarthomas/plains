/**
 * Exposes the defined CLI arguments to the Plains instance.
 */
class Argv {
  constructor() {
    // Defines the default CLI arguments.
    this.defaults = {
      task: false,
      mode: 'production',
      watch: false,
      verbose: false,
    };

    // Object wich stores the user defined CLI arguments.
    this.args = {};
  }

  /**
   * Defines the CLI argument for the current Argv instance.
   *
   * @returns {Object} Return an Object with the definitive CLI arguments.
   */
  define() {
    const { argv } = process;

    if (argv[2]) {
      argv.slice(2).forEach(arg => {
        // Store each argument with a key & value within the instance.
        // Arguments that don't have a value defined will be marked as TRUE.
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

    return Object.assign(this.defaults, this.args);
  }
}

module.exports = Argv;
