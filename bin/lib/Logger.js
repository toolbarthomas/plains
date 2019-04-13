const chalk = require('chalk');
const symbols = require('log-symbols');

class Logger {
  /**
   * Prints out an error message & exit the current process.
   *
   * @param {String|Array} message The message to display.
   */
  error(message) {
    this.outputMessages(message, 'error', 'error');

    process.exit(1);
  }

  /**
   * Prints out a warning message.
   *
   * @param {String|Array} message The message to display.
   */
  warning(message) {
    this.outputMessages(message, 'warn', 'warning');
  }

  /**
   * Prints out an success message.
   *
   * @param {String|Array} message The message to display.
   */
  success(message) {
    this.outputMessages(message, 'log', 'success');
  }

  /**
   * Prints out an info message.
   *
   * @param {String|Array} message The message to display.
   */
  info(message) {
    this.outputMessages(message, 'info', 'info');
  }

  /**
   * Check if the defined message has been split up in multiple lines.
   * Ouput a new console method for each message entry.
   *
   * @param {String|Array} message The actual message to output
   * @param {String} method Defines the method to use for the console Object.
   */
  outputMessages(message, method) {
    this.defineMessageStyle(method);

    if (message.constructor === Array && message instanceof Array) {
      message.forEach(m => {
        // eslint-disable-next-line no-console
        console[method](chalk[this.color](symbols[this.symbol], m));
      });
    } else {
      // eslint-disable-next-line no-console
      console[method](chalk[this.color](symbols[this.symbol], message));
    }
  }

  /**
   * Helper function for returning the correct styles from the defined method.
   *
   * @param {String} method The method to compare.
   *
   * @return {Object} The styles object to return.
   */
  defineMessageStyle(method) {
    switch (method) {
      case 'error':
        this.color = 'red';
        this.symbol = 'error';
        break;
      case 'warn':
        this.color = 'yellow';
        this.symbol = 'warning';
        break;
      case 'log':
        this.color = 'green';
        this.symbol = 'success';
        break;
      default:
        this.color = 'blue';
        this.symbol = 'info';
        break;
    }
  }
}

module.exports = new Logger();
