const chalk = require('chalk');
const symbols = require("log-symbols");

module.exports = {

  /**
   * Prints out an error message & exit the current process.
   *
   * @param {*} message Message to ouput.
   */
  error(message) {
    console.error(symbols.error, chalk.red(message));

    process.exit(1);
  },

  /**
   * Prints out a warning message.
   *
   * @param {*} message Message to ouput.
   */
  warning(message) {
    console.warn(symbols.warning, chalk.yellow(message));
  },

  /**
   * Prints out an success message.
   *
   * @param {*} message Message to ouput.
   */
  success(message) {
    console.log(symbols.success, chalk.green(message));
  },

  /**
   * Prints out an info message.
   *
   * @param {*} message Message to ouput.
   */
  info(message) {
    console.info(symbols.info, chalk.blue(message));
  }
};
