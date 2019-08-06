/* eslint-disable class-methods-use-this */

const chalk = require('chalk');
const symbols = require('log-symbols');

class Logger {
  /**
   * Prints out an error message & exit the current process.
   *
   * @param {String|Array} message The message to display.
   */
  error(message) {
    Logger.outputMessages(message, 'error');

    process.exit(1);
  }

  /**
   * Prints out a warning message.
   *
   * @param {String|Array} message The message to display.
   */
  warning(message) {
    Logger.outputMessages(message, 'warning');
  }

  /**
   * Prints out an success message.
   *
   * @param {String|Array} message The message to display.
   */
  success(message) {
    Logger.outputMessages(message, 'success');
  }

  /**
   * Prints out an info message.
   *
   * @param {String|Array} message The message to display.
   */
  info(message) {
    Logger.outputMessages(message, 'info');
  }

  /**
   * Displays log output when verbose logging is enabled.
   *
   * @param {String|Array} message The message to display.
   */
  log(message) {
    Logger.outputMessages(message, 'log');
  }

  /**
   * Check if the defined message has been split up in multiple lines.
   * Ouput a new console method for each message entry.
   *
   * @param {String|Array} message The actual message to output
   * @param {String} type Defines the message type to use for the console Object.
   */
  static outputMessages(message, type) {
    const properties = Logger.getMessageProperties(type);

    if (message.constructor === Array && message instanceof Array) {
      message.forEach(m => {
        // eslint-disable-next-line no-console
        console[properties.method](
          chalk[properties.color](properties.symbol ? symbols[properties.symbol] : ' ', m)
        );
      });
    } else {
      // eslint-disable-next-line no-console
      console[properties.method](
        chalk[properties.color](properties.symbol ? symbols[properties.symbol] : ' ', message)
      );
    }
  }

  /**
   * Helper function for returning the correct styles from the defined method.
   *
   * @param {String} method The method to compare.
   *
   * @return {Object} The styles object to return.
   */
  static getMessageProperties(method) {
    const properties = {};

    switch (method) {
      case 'error':
        properties.method = 'error';
        properties.color = 'red';
        properties.symbol = 'error';
        break;
      case 'warning':
        properties.method = 'warn';
        properties.color = 'yellow';
        properties.symbol = 'warning';
        break;
      case 'success':
        properties.method = 'log';
        properties.color = 'green';
        properties.symbol = 'success';
        break;
      case 'info':
        properties.method = 'info';
        properties.color = 'blue';
        properties.symbol = 'info';
        break;
      default:
        properties.method = 'log';
        properties.color = 'cyan';
        properties.symbol = false;
        break;
    }

    return properties;
  }
}

module.exports = new Logger();
