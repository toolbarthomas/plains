const chalk = require('chalk');
const symbols = require('log-symbols');

module.exports = {
  /**
   * Prints out an error message & exit the current process.
   *
   * @param {String} message Message to ouput.
   */
  error(message) {
    this.outputMessages(chalk.red(message), 'error', 'error');

    process.exit(1);
  },

  /**
   * Prints out a warning message.
   *
   * @param {String} message Message to ouput.
   */
  warning(message) {
    this.outputMessages(chalk.yellow(message), 'warn', 'warning');
  },

  /**
   * Prints out an success message.
   *
   * @param {String} message Message to ouput.
   */
  success(message) {
    this.outputMessages(chalk.green(message), 'log', 'success');
  },

  /**
   * Prints out an info message.
   *
   * @param {String} message Message to ouput.
   */
  info(message) {
    this.outputMessages(chalk.blue(message), 'info', 'info');
  },

  /**
   * Check if the defined message has been split up in multiple lines.
   * Ouput a new console method for each message entry.
   *
   * @param {String|Array} message The actual message to output
   * @param {String} method Defines the method to use for the console Object.
   * @param {String} symbold Defines the symbol type to use for the loggin symbol.
   */
  outputMessages(message, method, symbol) {
    if (message.constructor === Array && message instanceof Array) {
      message.forEach(m => {
        // eslint-disable-next-line no-console
        console[method](symbols[symbol], m);
      });
    } else {
      // eslint-disable-next-line no-console
      console[method](symbols[symbol], message);
    }
  }
};
