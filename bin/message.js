const chalk = require("chalk");
const symbols = require("log-symbols");

module.exports = {
  /**
   * Prints out an error message & exit the current process.
   *
   * @param {String} message Message to ouput.
   */
  error(message) {
    // eslint-disable-next-line no-console
    console.error(symbols.error, chalk.red(message));

    process.exit(1);
  },

  /**
   * Prints out a warning message.
   *
   * @param {String} message Message to ouput.
   */
  warning(message) {
    // eslint-disable-next-line no-console
    console.warn(symbols.warning, chalk.yellow(message));
  },

  /**
   * Prints out an success message.
   *
   * @param {String} message Message to ouput.
   */
  success(message) {
    // eslint-disable-next-line no-console
    console.log(symbols.success, chalk.green(message));
  },

  /**
   * Prints out an info message.
   *
   * @param {String} message Message to ouput.
   */
  info(message) {
    // eslint-disable-next-line no-console
    console.info(symbols.info, chalk.blue(message));
  },
};
