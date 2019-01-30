const chalk = require('chalk');
const symbols = require('log-symbols');

module.exports = {
  /**
   * Prints out an error message & exit the current process.
   *
   * @param {String|Array} message The message to display.
   */
  error(message) {
    this.outputMessages(message, 'error', 'error');

    process.exit(1);
  },

  /**
   * Prints out a warning message.
   *
   * @param {String|Array} message The message to display.
   */
  warning(message) {
    this.outputMessages(message, 'warn', 'warning');
  },

  /**
   * Prints out an success message.
   *
   * @param {String|Array} message The message to display.
   */
  success(message) {
    this.outputMessages(message, 'log', 'success');
  },

  /**
   * Prints out an info message.
   *
   * @param {String|Array} message The message to display.
   */
  info(message) {
    this.outputMessages(message, 'info', 'info');
  },

  /**
   * Check if the defined message has been split up in multiple lines.
   * Ouput a new console method for each message entry.
   *
   * @param {String|Array} message The actual message to output
   * @param {String} method Defines the method to use for the console Object.
   */
  outputMessages(message, method) {
    const styles = this.getMethodStyles(method);

    if (!styles) {
      return;
    }

    if (message.constructor === Array && message instanceof Array) {
      message.forEach(m => {
        // eslint-disable-next-line no-console
        console[method](chalk[styles.color](symbols[styles.symbol], m));
      });
    } else {
      // eslint-disable-next-line no-console
      console[method](chalk[styles.color](symbols[styles.symbol], message));
    }
  },

  /**
   * Helper function for returning the correct styles from the defined method.
   *
   * @param {String} method The method to compare.
   *
   * @return {Object} The styles object to return.
   */
  getMethodStyles(method) {
    const styles = {
      color: '',
      symbol: '',
    };

    switch (method) {
      case 'error':
        styles.color = 'red';
        styles.symbol = 'error';
        break;
      case 'warn':
        styles.color = 'yellow';
        styles.symbol = 'warning';
        break;
      case 'log':
        styles.color = 'green';
        styles.symbol = 'success';
        break;
      default:
        styles.color = 'blue';
        styles.symbol = 'info';
        break;
    }

    return styles;
  }
};
